import { Run } from '../runs/run';

export interface PullRequest {
  _id: string | any;
  name: string;
  runs: Run[];
  createdAt: Date;
}
