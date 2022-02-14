import { TaskPriority } from '../schemas/build.schema';

export class CreateBuildDto {
  readonly name: string;
  readonly pullRequestId: string;
  readonly type: string;
  readonly priority: TaskPriority;
}
