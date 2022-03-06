import { TaskPriority } from '../../tasks/task-priority';

export class CreateRunRequestDto {
  readonly name: string;
  readonly url?: string;
  readonly pullRequestName: string;
  readonly pullRequestUrl?: string;
  readonly type: string;
  readonly priority?: TaskPriority;
}
