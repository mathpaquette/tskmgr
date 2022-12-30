import { Run } from '../runs/run';
import { TaskPriority } from './task-priority';

export interface Task {
  id: number;
  run: Run;
  name: string;
  type: string;
  command: string;
  arguments: string[];
  options: object;
  runnerId: string;
  runnerInfo: { [key: string]: string };
  status: string;
  cached: boolean;
  duration: number;
  avgDuration: number;
  priority: TaskPriority;
  createdAt: Date;
  updatedAt: Date;
  startedAt: Date;
  endedAt: Date;
}
