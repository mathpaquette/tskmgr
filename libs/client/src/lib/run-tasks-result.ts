import { TaskResult } from './task-result';

export class RunTasksResult {
  public readonly completedTasks: TaskResult[];
  public readonly failedTasks: TaskResult[];

  public readonly completed: boolean;
  public readonly failed: boolean;

  constructor(public readonly tasks: TaskResult[]) {
    this.completedTasks = tasks.filter((x) => x.hasCompleted);
    this.failedTasks = tasks.filter((x) => !x.hasCompleted);

    this.completed = this.failedTasks.length === 0;
    this.failed = this.failedTasks.length > 0;
  }
}
