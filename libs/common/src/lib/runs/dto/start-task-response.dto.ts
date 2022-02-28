import { Task } from '../../tasks/task';

export class StartTaskResponseDto {
  readonly continue: boolean;
  readonly task: Task;
}
