import { TaskEntity } from './task.entity';
import { TaskStatus } from '@tskmgr/common';

export class TaskModel {
  readonly status: TaskStatus;
  readonly dependsOn: TaskModel[] = [];

  public constructor(entity: TaskEntity) {
    this.status = entity.status;
  }

  public hasDependencies(): boolean {
    return this.dependsOn.length > 0;
  }

  public getPendingTaskWithCompletedDependencies(): TaskModel {
    if (this.dependsOn.length === 0 && this.status === TaskStatus.Pending) {
      return this;
    }

    const visited = new Set<TaskModel>();
    const stack: TaskModel[] = [];
    stack.push(this);

    while (stack.length > 0) {
      const v = stack.pop();
      if (!visited.has(v)) {
        visited.add(v);
        for (const dep of v.dependsOn) {
          if (!visited.has(dep)) {
            stack.push(dep);
          }
        }
      }
    }

    return null;
  }

  public static mapFromEntities(entities: TaskEntity[]): TaskModel[] {
    const modelByName = new Map<string, TaskModel>();
    const withDependencies: TaskEntity[] = [];

    // create
    for (const entity of entities) {
      modelByName.set(entity.name, new TaskModel(entity));

      if (entity.dependsOn.length > 0) {
        withDependencies.push(entity);
      }
    }

    // dependencies
    for (const entity of withDependencies) {
      const model = modelByName.get(entity.name);

      for (const taskName of entity.dependsOn) {
        model.dependsOn.push(modelByName.get(taskName));
      }
    }

    return Array.from(modelByName.values());
  }
}
