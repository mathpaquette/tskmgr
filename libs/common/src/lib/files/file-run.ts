import { File } from './file';
import { Run } from '../runs/run';

export interface FileRun extends File {
  run: Run;
}
