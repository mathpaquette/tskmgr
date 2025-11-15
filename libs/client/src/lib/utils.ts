import { ChildProcess, spawn, SpawnOptionsWithoutStdio } from 'node:child_process';
import { createInterface } from 'node:readline';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import pRetry from 'p-retry';
import Debug from 'debug';

const debug = Debug('tskmgr:client');

export interface SpawnAsyncLineHandlers {
  dataHandler?: (line: string) => void;
  errorHandler?: (line: string) => void;
}

export async function spawnAsync(
  command: string,
  args?: ReadonlyArray<string>,
  options?: SpawnOptionsWithoutStdio,
  lineHandlers?: SpawnAsyncLineHandlers,
): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(command, args, options);

    if (lineHandlers?.dataHandler) {
      const readlineStdout = createInterface({ input: childProcess.stdout });
      readlineStdout.on('line', lineHandlers.dataHandler);
    }

    if (lineHandlers?.errorHandler) {
      const readlineStderr = createInterface({ input: childProcess.stderr });
      readlineStderr.on('line', lineHandlers.errorHandler);
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

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function getTaskLogFilename(taskId: number): string {
  return join(tmpdir(), `task-${taskId}.log`);
}

export async function fetchWithRetry<T>(input: string | URL | Request, init?: RequestInit): Promise<T> {
  const run = async () => {
    const response = await fetch(input, init);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}: ${input}`);
    }
    return response.json();
  };

  return pRetry(run, {
    retries: 3,
    onFailedAttempt: (error) => debug('Retry attempt failed:', error),
  });
}
