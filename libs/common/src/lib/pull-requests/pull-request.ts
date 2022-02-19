import { Build } from '../builds/build';

export interface PullRequest {
  _id: string | any;
  name: string;
  builds: Build[];
  createdAt: Date;
}
