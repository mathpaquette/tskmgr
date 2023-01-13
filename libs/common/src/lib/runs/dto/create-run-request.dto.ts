import { TaskPriority } from '../../tasks/task-priority';

export class CreateRunRequestDto {
  readonly name: string;
  readonly type: string;
  readonly url?: string;
  readonly parameters?: object;
  readonly prioritization?: TaskPriority[];
  /** affinity will try to reschedule task on previous runner id from matching run */
  readonly affinity?: boolean;
  readonly failFast?: boolean;
}
