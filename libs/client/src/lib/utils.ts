import { ChildProcess, spawn, SpawnOptionsWithoutStdio } from 'node:child_process';
import { createInterface } from 'node:readline';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export interface SpawnAsyncLineHandlers {
  dataHandler?: (line: string) => void;
  errorHandler?: (line: string) => void;
}

export async function spawnAsync(
  command: string,
  args?: ReadonlyArray<string>,
  options?: SpawnOptionsWithoutStdio,
  lineHandlers?: SpawnAsyncLineHandlers
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
