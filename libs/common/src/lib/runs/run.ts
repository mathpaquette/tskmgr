import { PullRequest } from '../pull-requests/pull-request';

export interface Run {
  _id: string | any;
  pullRequest: PullRequest;
  name: string;
  url: string;
  type: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  endedAt: Date;
  duration: number;
  priority: string;
  leaderId: string;
  runners: number;
}
