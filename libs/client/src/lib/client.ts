import { ChildProcess } from 'child_process';
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
import fetch from 'node-fetch';
import * as FormData from 'form-data';
import { checkStatus, delay, getTaskLogFilename, spawnAsync } from './utils';
import { RunTasksResult } from './run-tasks-result';
import { TaskResult } from './task-result';
import { ClientOptions } from './client-options';
import { createReadStream, createWriteStream, unlinkSync } from 'fs';

export class Client {
  public static readonly DefaultOptions: ClientOptions = {
    parallel: 1,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    dataCallback: (task, data, cached) => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    errorCallback: (task, data) => {},
    pollingDelayMs: 1000,
    retryDelayMs: 5000,
    retryCount: 2,
  };

  constructor(
    private readonly apiUrl: ApiUrl,
    private readonly runnerId: string,
    private readonly options: ClientOptions
  ) {}

  public async createRun(params: CreateRunRequestDto): Promise<Run> {
    const res = await fetch(this.apiUrl.createRunUrl(), {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify(params),
    });

    return await checkStatus(res).json();
  }

  public async closeRun(runId: number): Promise<Run> {
    const res = await fetch(this.apiUrl.closeRunUrl(runId), {
      headers: { 'Content-Type': 'application/json' },
      method: 'PUT',
    });

    return await checkStatus(res).json();
  }

  public async abortRun(runId: number): Promise<Run> {
    const res = await fetch(this.apiUrl.abortRunUrl(runId), {
      headers: { 'Content-Type': 'application/json' },
      method: 'PUT',
    });

    return await checkStatus(res).json();
  }

  public async failRun(runId: number): Promise<Run> {
    const res = await fetch(this.apiUrl.failRunUrl(runId), {
      headers: { 'Content-Type': 'application/json' },
      method: 'PUT',
    });

    return await checkStatus(res).json();
  }

  public async setLeader(runId: number): Promise<SetLeaderResponseDto> {
    const params: SetLeaderRequestDto = { runnerId: this.runnerId };
    const res = await fetch(this.apiUrl.setLeaderUrl(runId), {
      headers: { 'Content-Type': 'application/json' },
      method: 'PUT',
      body: JSON.stringify(params),
    });

    return await checkStatus(res).json();
  }

  public async createTasks(runId: number, params: CreateTasksDto): Promise<Task[]> {
    const res = await fetch(this.apiUrl.createTasksUrl(runId), {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify(params),
    });

    return await checkStatus(res).json();
  }

  public async startTask(runId: number, params: StartTaskDto): Promise<StartTaskResponseDto> {
    const res = await fetch(this.apiUrl.startTaskUrl(runId), {
      headers: { 'Content-Type': 'application/json' },
      method: 'PUT',
      body: JSON.stringify(params),
    });

    return await checkStatus(res).json();
  }

  public async runTasks(runId: number): Promise<RunTasksResult> {
    const taskRunners: Promise<TaskResult[]>[] = [];

    for (let i = 0; i < this.options.parallel; i++) {
      taskRunners.push(this.defaultTaskRunner(runId));
    }

    const taskResults = await Promise.all(taskRunners);
    return new RunTasksResult(taskResults.flatMap((x) => x));
  }

  public async completeTask(taskId: number, params: CompleteTaskDto): Promise<Task> {
    const res = await fetch(this.apiUrl.completeTaskUrl(taskId), {
      headers: { 'Content-Type': 'application/json' },
      method: 'PUT',
      body: JSON.stringify(params),
    });

    return await checkStatus(res).json();
  }

  public async failTask(taskId: number): Promise<Task> {
    const res = await fetch(this.apiUrl.failTaskUrl(taskId), {
      headers: { 'Content-Type': 'application/json' },
      method: 'PUT',
    });

    return await checkStatus(res).json();
  }

  public async uploadRunFile(runId: number, path: string, params: CreateFileRequestDto): Promise<File_> {
    return this.uploadFile(this.apiUrl.createFileRunUrl(runId), path, params);
  }

  public async uploadTaskFile(taskId: number, path: string, params: CreateFileRequestDto): Promise<File_> {
    return this.uploadFile(this.apiUrl.createFileTaskUrl(taskId), path, params);
  }

  private async uploadFile(url: string, path: string, params: CreateFileRequestDto): Promise<File_> {
    // https://github.com/node-fetch/node-fetch/tree/2.x#post-with-form-data-detect-multipart
    // https://github.com/form-data/form-data#readme

    const formData = new FormData();
    formData.append('file', createReadStream(path));

    if (params.type) {
      formData.append('type', params.type);
    }

    if (params.description) {
      formData.append('description', params.description);
    }

    const res = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    return await checkStatus(res).json();
  }

  private async defaultTaskRunner(runId: number): Promise<TaskResult[]> {
    const taskResults: TaskResult[] = [];
    let _continue = true;

    while (_continue) {
      const response = await this.startTask(runId, { runnerId: this.runnerId });

      if (!response.continue) {
        _continue = false;
        continue;
      }

      if (!response.task) {
        // TODO: this should output only once per runner
        console.log(`polling for a new task in: ${this.options.pollingDelayMs} ms`);
        await delay(this.options.pollingDelayMs);
        continue;
      }

      const { run, task } = response;
      let cached = false;
      let hasCompleted = true;
      let childProcess: ChildProcess;
      let error: Error;

      const taskLogFilename = getTaskLogFilename(task.id);
      const writeStream = createWriteStream(taskLogFilename);

      const dataHandler = (data: string): void => {
        this.options.dataCallback(task, data, () => (cached = true));
      };

      const errorHandler = (data: string): void => {
        this.options.errorCallback(task, data);
      };

      try {
        childProcess = await spawnAsync(
          task.command,
          task.arguments,
          {
            ...task.options,
            ...this.options.spawnOptions,
          },
          {
            writeStream,
            dataCallback: dataHandler,
            errorCallback: errorHandler,
          }
        );
      } catch (err) {
        error = err;
        hasCompleted = false;

        if (run.failFast) {
          // TODO: should abort all running tasks by current client
          throw err;
        }
      } finally {
        taskResults.push({ run, task, childProcess, hasCompleted, error });

        if (hasCompleted) {
          await this.completeTask(task.id, { cached });
        } else {
          await this.failTask(task.id);
        }

        writeStream.close();
        await this.uploadTaskFile(task.id, taskLogFilename, {
          type: 'log',
          description: `Log for task ${task.id}`,
        });
        unlinkSync(taskLogFilename);
      }
    }

    return taskResults;
  }
}
