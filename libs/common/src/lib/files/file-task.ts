import { File } from './file';
import { Task } from '../tasks/task';

export interface FileTask extends File {
  task: Task;
}
