import { Run } from '../runs/run';
import { TaskPriority } from './task-priority';
import { RunnerInfo } from './runner-info';
import { File } from '../files/file';

export interface Task {
  id: number;
  run: Run;
  name: string;
  type: string;
  command: string;
  arguments: string[];
  options: TaskOptions;
  runnerId: string;
  runnerInfo: RunnerInfo;
  status: string;
  cached: boolean;
  duration: number;
  avgDuration: number;
  priority: TaskPriority;
  createdAt: Date;
  updatedAt: Date;
  startedAt: Date | null;
  endedAt: Date | null;
  files: File[];
}

export interface TaskOptions {
  cwd?: string;
  env?: { [key: string]: string };
  argv0?: string;
  detached?: boolean;
  uid?: number;
  gid?: number;
  serialization?: string;
  shell?: boolean;
  signal?: object;
  timeout?: number;
  killSignal?: string | number;
}
