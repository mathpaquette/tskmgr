import { ChildProcess, spawn, SpawnOptionsWithoutStdio } from 'child_process';
import {
  ApiUrl,
  Build,
  CompleteTaskDto,
  CreateBuildRequestDto,
  CreateTasksDto,
  StartTaskDto,
  StartTaskResponseDto,
  Task,
} from '@tskmgr/common';
import fetch from 'node-fetch';

export class Client {
  constructor(
    private readonly apiUrl: ApiUrl,
    private readonly runnerId: string,
    private readonly parallel: number,
    private readonly dataCallback: (task: Task, data: any, cached: () => void) => void,
    private readonly errorCallback: (task: Task, data: any) => void,
    private readonly pollingDelayMs,
    private readonly retryDelayMs,
    private readonly retryCount
  ) {}

  public async createBuild(params: CreateBuildRequestDto): Promise<Build> {
    const res = await fetch(this.apiUrl.createBuildUrl(), {
      method: 'POST',
      body: JSON.stringify(params),
      headers: { 'Content-Type': 'application/json' },
    });

    return await checkStatus(res).json();
  }

  public async closeBuild(id: string): Promise<Build> {
    const res = await fetch(this.apiUrl.closeBuildUrl(id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    });

    return await checkStatus(res).json();
  }

  public async createTasks(id: string, params: CreateTasksDto): Promise<Task[]> {
    const res = await fetch(this.apiUrl.createTasksUrl(id), {
      method: 'POST',
      body: JSON.stringify(params),
      headers: { 'Content-Type': 'application/json' },
    });

    return await checkStatus(res).json();
  }

  public async startTask(id: string, params: StartTaskDto): Promise<StartTaskResponseDto> {
    const res = await fetch(this.apiUrl.startTaskUrl(id), {
      method: 'PUT',
      body: JSON.stringify(params),
      headers: { 'Content-Type': 'application/json' },
    });

    return await checkStatus(res).json();
  }

  public async completeTask(id: string, params: CompleteTaskDto): Promise<Task> {
    const res = await fetch(this.apiUrl.completeTaskUrl(id), {
      method: 'PUT',
      body: JSON.stringify(params),
      headers: { 'Content-Type': 'application/json' },
    });

    return await checkStatus(res).json();
  }

  public async failTask(id: string): Promise<Task> {
    const res = await fetch(this.apiUrl.failTaskUrl(id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    });

    return await checkStatus(res).json();
  }

  public runTasks(id: string): Promise<void[]> {
    const taskRunners = [];

    for (let i = 0; i < this.parallel; i++) {
      taskRunners.push(this.defaultTaskRunner(id));
    }

    return Promise.all(taskRunners);
  }

  async defaultTaskRunner(id: string): Promise<void> {
    let _continue = true;

    while (_continue) {
      const response = await this.startTask(id, { runnerId: this.runnerId });

      if (!response.continue) {
        _continue = false;
      }

      if (!response.continue && !response.task) {
        continue;
      }

      if (!response.task) {
        console.log(`polling for a new task in: ${this.pollingDelayMs} ms`);
        await delay(this.pollingDelayMs);
        continue;
      }

      const { task } = response;
      let cached = false;
      let hasCompleted = true;

      const dataHandler = (data: any): void => {
        this.dataCallback(task, data, () => (cached = true));
      };

      const errorHandler = (data: any): void => {
        this.errorCallback(task, data);
      };

      try {
        await spawnAsync(task.command, task.arguments, task.options, dataHandler, errorHandler);
      } catch (e) {
        hasCompleted = false;
        throw e;
      } finally {
        if (hasCompleted) {
          await this.completeTask(task._id, { cached });
        } else {
          await this.failTask(task._id);
        }
      }
    }
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
  dataCallback?: (data: any) => void,
  errorCallback?: (data: any) => void
): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(command, args, options);

    if (dataCallback) {
      childProcess.stdout.on('data', (data) => dataCallback(data));
    }

    if (errorCallback) {
      childProcess.stderr.on('data', (data) => errorCallback(data));
    }

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
