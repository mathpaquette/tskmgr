import { PullRequest } from '../pull-requests/pull-request';
import { TaskPriority } from '../tasks/task-priority';

export interface Run {
  id: number;
  pullRequest: PullRequest;
  name: string;
  url: string;
  type: string;
  status: string;
  closed: boolean;
  createdAt: Date;
  updatedAt: Date;
  endedAt: Date;
  duration: number;
  prioritization: TaskPriority[];
  leaderId: string;
  runners: number;
  affinity: boolean;
  failFast: boolean;
}
