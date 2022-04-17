import { PullRequest } from '../pull-requests/pull-request';
import { TaskPriority } from '../tasks/task-priority';

export interface Run {
  _id: string | any;
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
  runnerAffinity: boolean;
}
