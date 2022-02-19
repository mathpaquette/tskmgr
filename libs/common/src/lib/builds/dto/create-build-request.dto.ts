import { TaskPriority } from '@tskmgr/common';

export class CreateBuildRequestDto {
  readonly name: string;
  readonly pullRequestId: string;
  readonly type: string;
  readonly priority?: TaskPriority;
}
