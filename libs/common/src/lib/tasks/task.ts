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
  options: object;
  runnerId: string;
  runnerInfo: RunnerInfo;
  status: string;
  cached: boolean;
  duration: number;
  avgDuration: number;
  priority: TaskPriority;
  createdAt: Date;
  updatedAt: Date;
  startedAt: Date;
  endedAt: Date;
  files: File[];
}
