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

export class Client {
  constructor(
    private readonly apiUrl: ApiUrl,
    private readonly runnerId: string,
    private readonly parallel: number,
    private readonly dataCallback: (task: Task, data: string, cached: () => void) => void,
    private readonly errorCallback: (task: Task, data: string) => void,
    private readonly pollingDelayMs,
    private readonly retryDelayMs,
    private readonly retryCount
  ) {}

  public async createRun(params: CreateRunRequestDto): Promise<Run> {
    const res = await fetch(this.apiUrl.createRunUrl(), {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify(params),
    });

    return await checkStatus(res).json();
  }

  public async closeRun(id: string): Promise<Run> {
    const res = await fetch(this.apiUrl.closeRunUrl(id), {
      headers: { 'Content-Type': 'application/json' },
      method: 'PUT',
    });

    return await checkStatus(res).json();
  }

  public async setLeader(id: string): Promise<SetLeaderResponseDto> {
    const params: SetLeaderRequestDto = { runnerId: this.runnerId };
    const res = await fetch(this.apiUrl.setLeaderUrl(id), {
      headers: { 'Content-Type': 'application/json' },
      method: 'PUT',
      body: JSON.stringify(params),
    });

    return await checkStatus(res).json();
  }

  public async createTasks(id: string, params: CreateTasksDto): Promise<Task[]> {
    const res = await fetch(this.apiUrl.createTasksUrl(id), {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify(params),
    });

    return await checkStatus(res).json();
  }

  public async startTask(id: string, params: StartTaskDto): Promise<StartTaskResponseDto> {
    const res = await fetch(this.apiUrl.startTaskUrl(id), {
      headers: { 'Content-Type': 'application/json' },
      method: 'PUT',
      body: JSON.stringify(params),
    });

    return await checkStatus(res).json();
  }

  public async completeTask(id: string, params: CompleteTaskDto): Promise<Task> {
    const res = await fetch(this.apiUrl.completeTaskUrl(id), {
      headers: { 'Content-Type': 'application/json' },
      method: 'PUT',
      body: JSON.stringify(params),
    });

    return await checkStatus(res).json();
  }

  public async failTask(id: string): Promise<Task> {
    const res = await fetch(this.apiUrl.failTaskUrl(id), {
      headers: { 'Content-Type': 'application/json' },
      method: 'PUT',
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

      const dataHandler = (data: string): void => {
        this.dataCallback(task, data, () => (cached = true));
      };

      const errorHandler = (data: string): void => {
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
