import { ChildProcess, spawn, SpawnOptionsWithoutStdio } from 'child_process';
import { createInterface } from 'readline';
import { WriteStream } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

export interface SpawnAsyncOptions {
  writeStream?: WriteStream;
  dataCallback?: (data: string) => void;
  errorCallback?: (data: string) => void;
}

export async function spawnAsync(
  command: string,
  args?: ReadonlyArray<string>,
  options?: SpawnOptionsWithoutStdio,
  logging?: SpawnAsyncOptions
): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(command, args, options);

    if (logging.writeStream) {
      childProcess.stdout.pipe(logging.writeStream);
      childProcess.stderr.pipe(logging.writeStream);
    }

    if (logging.dataCallback) {
      const readlineStdout = createInterface({ input: childProcess.stdout });
      readlineStdout.on('line', logging.dataCallback);
    }

    if (logging.errorCallback) {
      const readlineStderr = createInterface({ input: childProcess.stderr });
      readlineStderr.on('line', logging.errorCallback);
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

export class HTTPResponseError extends Error {
  constructor(public readonly response) {
    super(`HTTP Error Response: ${response.status} ${response.statusText}`);
    this.response = response;
  }
}

export const checkStatus = (response) => {
  if (response.ok) {
    // response.status >= 200 && response.status < 300
    return response;
  } else {
    throw new HTTPResponseError(response);
  }
};
