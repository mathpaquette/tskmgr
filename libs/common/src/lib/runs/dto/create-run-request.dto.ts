import { TaskPriority } from '../../tasks/task-priority';
import { CreatePullRequestDto } from '../../pull-requests/dto/create-pull-request.dto';

export class CreateRunRequestDto {
  readonly name: string;
  readonly type: string;
  readonly pullRequest?: CreatePullRequestDto;
  readonly url?: string;
  readonly prioritization?: TaskPriority[];
  readonly runners?: number;
  /** affinity will try to reschedule task on previous runner id */
  readonly affinity?: boolean;
  readonly failFast?: boolean;
}
