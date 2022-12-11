import { Run } from '../runs/run';

export interface PullRequest {
  id: number;
  name: string;
  url: string;
  runs: Run[];
  createdAt: Date;
  updatedAt: Date;
}
