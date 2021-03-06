/* eslint-disable @typescript-eslint/no-empty-function */
import { ChildProcess, spawn, SpawnOptionsWithoutStdio } from 'child_process';
import {
  ApiUrl,
  Run,
  CompleteTaskDto,
  CreateRunRequestDto,
  CreateTasksDto,
  StartTaskDto,
  StartTaskResponseDto,
  Task,
  SetLeaderRequestDto,
  SetLeaderResponseDto,
} from '@tskmgr/common';
import fetch from 'node-fetch';
import { createInterface } from 'readline';

export interface ClientOptions {
  parallel?: number;
  dataCallback?: (task: Task, data: string, cached: () => void) => void;
  errorCallback?: (task: Task, data: string) => void;
  pollingDelayMs?: number;
  retryDelayMs?: number;
  retryCount?: number;
  spawnOptions?: SpawnOptionsWithoutStdio;
}

export class Client {
  public static readonly DefaultOptions: ClientOptions = {
    parallel: 1,
    dataCallback: (task, data, cached) => {},
    errorCallback: (task, data) => {},
    pollingDelayMs: 1000,
    retryDelayMs: 5000,
    retryCount: 2,
  };

  constructor(
    private readonly apiUrl: ApiUrl, //
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

  public async closeRun(runId: string): Promise<Run> {
    const res = await fetch(this.apiUrl.closeRunUrl(runId), {
      headers: { 'Content-Type': 'application/json' },
      method: 'PUT',
    });

    return await checkStatus(res).json();
  }

  public async abortRun(runId: string): Promise<Run> {
    const res = await fetch(this.apiUrl.abortRunUrl(runId), {
      headers: { 'Content-Type': 'application/json' },
      method: 'PUT',
    });

    return await checkStatus(res).json();
  }

  public async failRun(runId: string): Promise<Run> {
    const res = await fetch(this.apiUrl.failRunUrl(runId), {
      headers: { 'Content-Type': 'application/json' },
      method: 'PUT',
    });

    return await checkStatus(res).json();
  }

  public async setLeader(runId: string): Promise<SetLeaderResponseDto> {
    const params: SetLeaderRequestDto = { runnerId: this.runnerId };
    const res = await fetch(this.apiUrl.setLeaderUrl(runId), {
      headers: { 'Content-Type': 'application/json' },
      method: 'PUT',
      body: JSON.stringify(params),
    });

    return await checkStatus(res).json();
  }

  public async createTasks(runId: string, params: CreateTasksDto): Promise<Task[]> {
    const res = await fetch(this.apiUrl.createTasksUrl(runId), {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify(params),
    });

    return await checkStatus(res).json();
  }

  public async startTask(runId: string, params: StartTaskDto): Promise<StartTaskResponseDto> {
    const res = await fetch(this.apiUrl.startTaskUrl(runId), {
      headers: { 'Content-Type': 'application/json' },
      method: 'PUT',
      body: JSON.stringify(params),
    });

    return await checkStatus(res).json();
  }

  public async runTasks(runId: string): Promise<RunTasksResult> {
    const taskRunners: Promise<TaskResult[]>[] = [];

    for (let i = 0; i < this.options.parallel; i++) {
      taskRunners.push(this.defaultTaskRunner(runId));
    }

    const taskResults = await Promise.all(taskRunners);
    return new RunTasksResult(taskResults.flatMap((x) => x));
  }

  public async completeTask(taskId: string, params: CompleteTaskDto): Promise<Task> {
    const res = await fetch(this.apiUrl.completeTaskUrl(taskId), {
      headers: { 'Content-Type': 'application/json' },
      method: 'PUT',
      body: JSON.stringify(params),
    });

    return await checkStatus(res).json();
  }

  public async failTask(taskId: string): Promise<Task> {
    const res = await fetch(this.apiUrl.failTaskUrl(taskId), {
      headers: { 'Content-Type': 'application/json' },
      method: 'PUT',
    });

    return await checkStatus(res).json();
  }

  private async defaultTaskRunner(runId: string): Promise<TaskResult[]> {
    const taskResults: TaskResult[] = [];
    let _continue = true;

    while (_continue) {
      const response = await this.startTask(runId, { runnerId: this.runnerId });

      if (!response.continue) {
        _continue = false;
      }

      if (!response.continue && !response.task) {
        continue;
      }

      if (!response.task) {
        console.log(`polling for a new task in: ${this.options.pollingDelayMs} ms`);
        await delay(this.options.pollingDelayMs);
        continue;
      }

      const { run, task } = response;
      let cached = false;
      let hasCompleted = true;
      let childProcess: ChildProcess;
      let error: Error;

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
          { ...task.options, ...this.options.spawnOptions },
          dataHandler,
          errorHandler
        );
      } catch (err) {
        error = err;
        hasCompleted = false;
        if (run.failFast) {
          throw err;
        }
      } finally {
        taskResults.push({ run, task, childProcess, hasCompleted, error });
        if (hasCompleted) {
          await this.completeTask(task._id, { cached });
        } else {
          await this.failTask(task._id);
        }
      }
    }

    return taskResults;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function spawnAsync(
  command: string,
  args?: ReadonlyArray<string>,
  options?: SpawnOptionsWithoutStdio,
  dataCallback?: (data: string) => void,
  errorCallback?: (data: string) => void
): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(command, args, options);

    const readlineStdout = createInterface({ input: childProcess.stdout });
    const readlineStderr = createInterface({ input: childProcess.stderr });

    readlineStdout.on('line', dataCallback);
    readlineStderr.on('line', errorCallback);

    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve(childProcess);
      } else {
        reject(childProcess);
      }
    });

    childProcess.on('error', (err: Error) => {
      reject(childProcess); // TODO: try to return error message
    });
  });
}

class HTTPResponseError extends Error {
  constructor(public readonly response) {
    super(`HTTP Error Response: ${response.status} ${response.statusText}`);
    this.response = response;
  }
}

const checkStatus = (response) => {
  if (response.ok) {
    // response.status >= 200 && response.status < 300
    return response;
  } else {
    throw new HTTPResponseError(response);
  }
};

export interface TaskResult {
  run: Run;
  task: Task;
  childProcess: ChildProcess;
  hasCompleted: boolean;
  error?: Error;
}

export class RunTasksResult {
  public readonly completedTasks: TaskResult[];
  public readonly failedTasks: TaskResult[];

  public readonly completed: boolean;
  public readonly failed: boolean;

  constructor(public readonly tasks: TaskResult[]) {
    this.completedTasks = tasks.filter((x) => x.hasCompleted);
    this.failedTasks = tasks.filter((x) => !x.hasCompleted);

    this.completed = this.failedTasks.length === 0;
    this.failed = this.failedTasks.length > 0;
  }
}
