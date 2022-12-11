import { TaskPriority } from '../../tasks/task-priority';
import { CreatePullRequestDto } from '../../pull-requests/dto/create-pull-request.dto';

export class CreateRunRequestDto {
  readonly name: string;
  readonly pullRequest: CreatePullRequestDto;
  readonly type: string;
  readonly url?: string;
  readonly prioritization?: TaskPriority[];
  readonly runners?: number;
  /** runnerAffinity will reschedule tasks from one pull request on previous runner. Default: true */
  readonly runnerAffinity?: boolean;
  readonly failFast?: boolean;
}
