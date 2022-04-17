import { Run } from '../run';
import { Task } from '../../tasks/task';

export class StartTaskResponseDto {
  readonly continue: boolean;
  readonly run: Run;
  readonly task: Task;
}
