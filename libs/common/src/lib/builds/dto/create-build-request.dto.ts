import { TaskPriority } from '../../tasks/task-priority';

export class CreateBuildRequestDto {
  readonly name: string;
  readonly pullRequestId: string;
  readonly type: string;
  readonly priority?: TaskPriority;
}
