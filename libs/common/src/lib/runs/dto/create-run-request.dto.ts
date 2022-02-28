import { TaskPriority } from '../../tasks/task-priority';

export class CreateRunRequestDto {
  readonly name: string;
  readonly pullRequestId: string;
  readonly type: string;
  readonly priority?: TaskPriority;
}
