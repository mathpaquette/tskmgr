import { Run } from '../runs/run';
import { Task } from '../tasks/task';

export interface File {
  id: number;
  originName: string;
  filename: string;
  createdAt: Date;
  mimeType: string;
  type: string;
  description: string;
  run: Run;
  task: Task;
}
