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
  runnerHost: string;
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
