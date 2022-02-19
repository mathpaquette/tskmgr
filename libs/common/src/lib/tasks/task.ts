import { Build } from '../builds/build';
import { PullRequest } from '../pull-requests/pull-request';

export interface Task {
  _id: string | any;
  build: Build;
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
  startedAt: Date;
  endedAt: Date;
  cached: boolean;
  duration: number;
  avgDuration: number;
}
