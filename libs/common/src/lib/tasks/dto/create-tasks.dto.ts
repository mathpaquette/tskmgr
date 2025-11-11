import { TaskPriority } from '../task-priority';

export class CreateTasksDto {
  readonly tasks: CreateTaskDto[];
}

export class CreateTaskDto {
  readonly name: string;
  readonly type: string;
  readonly command: string;
  readonly arguments?: string[];
  readonly options?: object;
  readonly priority?: TaskPriority;
  /**
   * @deprecated Use `dependencies` instead.
   */
  readonly dependsOn?: string[];
  readonly dependencies?: string[];
}
