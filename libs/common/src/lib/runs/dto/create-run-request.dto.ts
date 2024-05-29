import { TaskPriority } from '../../tasks/task-priority';

export class CreateRunRequestDto {
  readonly name: string;
  readonly type: string;
  readonly url?: string;
  readonly info?: object;
  readonly parameters?: object;
  readonly prioritization?: TaskPriority[];
  readonly failFast?: boolean;
}
