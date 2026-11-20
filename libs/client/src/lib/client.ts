import { ChildProcess } from 'node:child_process';
import {
  ApiUrl,
  Run,
  CompleteTaskDto,
  CreateRunRequestDto,
  CreateTasksDto,
  StartTaskDto,
  StartTaskResponseDto,
  Task,
  File as File_,
  SetLeaderRequestDto,
  SetLeaderResponseDto,
  CreateFileRequestDto,
} from '@tskmgr/common';
import { delay, fetchWithRetry, getTaskLogFilename, spawnAsync } from './utils';
import { RunTasksResult } from './run-tasks-result';
import { TaskResult } from './task-result';
import { ClientOptions } from './client-options';
import { createWriteStream, unlinkSync } from 'node:fs';
import Debug from 'debug';
import { readFile } from 'node:fs/promises';
import { SpawnOptionsWithoutStdio } from 'node:child_process';

const debug = Debug('tskmgr:client');

export class Client {
  public static readonly DefaultOptions: ClientOptions = {
    parallel: 1,
    dataCallback: (task, data, cached) => {
      // noop
    },
    errorCallback: (task, data) => {
      // noop
    },
    pollingDelayMs: 5000,
    retryDelayMs: 5000,
    retryCount: 2,
  };

  constructor(
    private readonly apiUrl: ApiUrl,
    private readonly runnerId: string,
    private readonly clientOptions: ClientOptions,
  ) {}

  public async createRun(params: CreateRunRequestDto): Promise<Run> {
    return this.request(this.apiUrl.createRunUrl(), {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  public async closeRun(runId: number): Promise<Run> {
    return this.request(this.apiUrl.closeRunUrl(runId), {
      method: 'PUT',
    });
  }

  public async abortRun(runId: number): Promise<Run> {
    return this.request(this.apiUrl.abortRunUrl(runId), {
      method: 'PUT',
    });
  }

  public async failRun(runId: number): Promise<Run> {
    return this.request(this.apiUrl.failRunUrl(runId), {
      method: 'PUT',
    });
  }

  public async setLeader(runId: number): Promise<SetLeaderResponseDto> {
    const params: SetLeaderRequestDto = { runnerId: this.runnerId };
    return this.request(this.apiUrl.setLeaderUrl(runId), {
      method: 'PUT',
      body: JSON.stringify(params),
    });
  }

  public async createTasks(runId: number, params: CreateTasksDto): Promise<Task[]> {
    return this.request(this.apiUrl.createTasksUrl(runId), {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  public async startTask(runId: number, params: StartTaskDto): Promise<StartTaskResponseDto> {
    return this.request(this.apiUrl.startTaskUrl(runId), {
      method: 'PUT',
      body: JSON.stringify(params),
    });
  }

  public async runTasks(runId: number): Promise<RunTasksResult> {
    const taskRunners: Promise<TaskResult[]>[] = [];

    for (let i = 0; i < this.clientOptions.parallel; i++) {
      taskRunners.push(this.defaultParallelTaskRunner(runId, i));
    }

    const taskResults = await Promise.all(taskRunners);
    return new RunTasksResult(taskResults.flatMap((x) => x));
  }

  public async completeTask(taskId: number, params: CompleteTaskDto): Promise<Task> {
    return this.request(this.apiUrl.completeTaskUrl(taskId), {
      method: 'PUT',
      body: JSON.stringify(params),
    });
  }

  public async failTask(taskId: number): Promise<Task> {
    return this.request(this.apiUrl.failTaskUrl(taskId), {
      method: 'PUT',
    });
  }

  public async uploadRunFile(runId: number, path: string, params: CreateFileRequestDto): Promise<File_> {
    return this.uploadFile(this.apiUrl.createFileRunUrl(runId), path, params);
  }

  public async uploadTaskFile(taskId: number, path: string, params: CreateFileRequestDto): Promise<File_> {
    return this.uploadFile(this.apiUrl.createFileTaskUrl(taskId), path, params);
  }

  private async uploadFile(url: string, path: string, params: CreateFileRequestDto): Promise<File_> {
    const formData = new FormData();

    const blob = new Blob([await readFile(path)]);
    formData.append('file', blob, path);

    if (params.type) {
      formData.append('type', params.type);
    }

    if (params.description) {
      formData.append('description', params.description);
    }

    return this.request(url, {
      method: 'POST',
      body: formData,
    });
  }

  private request<T>(url: string, init: RequestInit): Promise<T> {
    const { headers: customHeaders } = this.clientOptions;
    return fetchWithRetry<T>(url, async () => {
      const headers = new Headers(typeof customHeaders === 'function' ? await customHeaders() : customHeaders);

      if (init.body instanceof FormData) {
        headers.delete('Content-Type');
      } else if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }

      return {
        ...init,
        headers,
        redirect: customHeaders === undefined ? init.redirect : 'error',
      };
    });
  }

  private async defaultParallelTaskRunner(runId: number, parallelId: number): Promise<TaskResult[]> {
    const logInfo = `[${this.runnerId}:${parallelId}]`;
    const taskResults: TaskResult[] = [];
    let _continue = true;

    debug(`${logInfo} parallel task runner started`);

    while (_continue) {
      const res = await this.startTask(runId, { runnerId: this.runnerId });

      if (!res.continue) {
        debug(`${logInfo} continue set to false`);
        _continue = false;
      }

      if (!res.continue && !res.task) {
        debug(`${logInfo} continue set to false and no task, exiting`);
        continue;
      }

      if (!res.task) {
        debug(`${logInfo} polling for new tasks in ${this.clientOptions.pollingDelayMs} ms`);
        await delay(this.clientOptions.pollingDelayMs);
        continue;
      }

      const { run, task } = res;
      debug(`${logInfo} received task: ${task.id}`);

      let cached = false;
      let completed = false;
      let writable = false;
      let childProcess: ChildProcess;
      let error: Error;

      const taskLogFilename = getTaskLogFilename(task.id);
      const writeStream = createWriteStream(taskLogFilename);
      writeStream.on('open', () => (writable = true));

      const dataHandler = (data: string): void => {
        this.clientOptions.dataCallback(task, data, () => (cached = true));
        if (writable) {
          writeStream.write(`[${new Date().toISOString()}] ${data}\n`);
        }
      };

      const errorHandler = (data: string): void => {
        this.clientOptions.errorCallback(task, data);
        if (writable) {
          writeStream.write(`[${new Date().toISOString()}] ${data}\n`);
        }
      };

      const spawnOptions: SpawnOptionsWithoutStdio = {
        ...(task.options as SpawnOptionsWithoutStdio),
        ...this.clientOptions.spawnOptions,
        env: {
          ...process.env,
          ...task.options?.env,
          ...this.clientOptions.spawnOptions?.env,
          TSKMGR_PARALLEL_ID: parallelId.toString(),
        },
      };

      debug(`${logInfo} starting task: ${task.id}`);
      try {
        childProcess = await spawnAsync(task.command, task.arguments, spawnOptions, {
          dataHandler,
          errorHandler,
        });
        completed = true;
        debug(`${logInfo} completed task: ${task.id}`);
      } catch (err) {
        console.error(`${logInfo} failed task: ${task.id} with error: ${err}`);
        error = err;

        if (run.failFast) {
          // TODO: should abort all running tasks by current client
          debug(`${logInfo} fail fast enabled, aborting`);
          throw err;
        }
      } finally {
        taskResults.push({ run, task, childProcess, completed, error });

        if (completed) {
          await this.completeTask(task.id, { cached });
          debug(`${logInfo} completed status for task: ${task.id} sent`);
        } else {
          await this.failTask(task.id);
          debug(`${logInfo} failed status for task: ${task.id} sent`);
        }

        writeStream.end();
        writeStream.close();

        await this.uploadTaskFile(task.id, taskLogFilename, {
          type: 'log',
          description: `Log for task ${task.id}`,
        });

        debug(`${logInfo} uploaded file for task: ${task.id} sent`);
        unlinkSync(taskLogFilename);
      }
    }

    debug(`${logInfo} parallel task runner completed`);

    return taskResults;
  }
}
