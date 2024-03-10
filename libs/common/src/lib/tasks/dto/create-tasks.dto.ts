import { TaskPriority } from '../task-priority';

export class CreateTasksDto {
  readonly tasks: CreateTaskDto[];
}

export interface DependentProject {
  project: string;
  target: string;
}

export class CreateTaskDto {
  readonly name: string;
  readonly type: string;
  readonly command: string;
  readonly dependsOn?: DependentProject[];
  readonly arguments?: string[];
  readonly options?: object;
  readonly priority?: TaskPriority;
}
