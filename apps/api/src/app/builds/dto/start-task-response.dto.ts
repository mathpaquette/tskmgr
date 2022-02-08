import { Task } from '../../tasks/schemas/task.schema';

export class StartTaskResponseDto {
  readonly continue: boolean;
  readonly task: Task;
}
