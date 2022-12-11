import { Run } from '../runs/run';
import { PullRequest } from '../pull-requests/pull-request';
import { TaskPriority } from './task-priority';

export interface Task {
  id: number;
  run: Run;
  pullRequest: PullRequest;
  name: string;
  type: string;
  command: string;
  arguments: string[];
  options: object;
  runnerId: string;
  runnerHost: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  startedAt: Date;
  endedAt: Date;
  cached: boolean;
  duration: number;
  avgDuration: number;
  priority: TaskPriority;
}
