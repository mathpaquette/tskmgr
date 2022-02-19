import { PullRequest } from '../pull-requests/pull-request';

export interface Build {
  _id: string | any;
  pullRequest: PullRequest;
  name: string;
  type: string;
  status: string;
  createdAt: Date;
  endedAt: Date;
  duration: number;
  priority: string;
}
