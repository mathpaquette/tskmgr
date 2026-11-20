import { Task } from '@tskmgr/common';
import { SpawnOptionsWithoutStdio } from 'child_process';

type RequestHeaders = NonNullable<RequestInit['headers']>;

export interface ClientOptions {
  /** Additional request headers, resolved before each fetch attempt. */
  headers?: RequestHeaders | (() => RequestHeaders | Promise<RequestHeaders>);
  parallel?: number;
  dataCallback?: (task: Task, data: string, cached: () => void) => void;
  errorCallback?: (task: Task, data: string) => void;
  pollingDelayMs?: number;
  retryDelayMs?: number;
  retryCount?: number;
  spawnOptions?: SpawnOptionsWithoutStdio;
}
