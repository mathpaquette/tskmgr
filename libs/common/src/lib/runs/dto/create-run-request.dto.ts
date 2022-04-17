import { TaskPriority } from '../../tasks/task-priority';

export class CreateRunRequestDto {
  readonly name: string;
  readonly url?: string;
  readonly pullRequestName: string;
  readonly pullRequestUrl?: string;
  readonly type: string;
  readonly prioritization?: TaskPriority[];
  readonly runners?: number;
  /** runnerAffinity will reschedule tasks from one pull request on previous runner. Default: true */
  readonly runnerAffinity?: boolean;
  readonly failFast?: boolean;
}
