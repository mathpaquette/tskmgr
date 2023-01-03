import { Task } from '@tskmgr/common';
import { SpawnOptionsWithoutStdio } from 'child_process';

export interface ClientOptions {
  parallel?: number;
  dataCallback?: (task: Task, data: string, cached: () => void) => void;
  errorCallback?: (task: Task, data: string) => void;
  pollingDelayMs?: number;
  retryDelayMs?: number;
  retryCount?: number;
  spawnOptions?: SpawnOptionsWithoutStdio;
}
