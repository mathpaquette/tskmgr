import { DAG } from './dag';
import { TaskEntity } from './task.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DagService {
  public getDependantTasks(taskName: string, tasks: TaskEntity[]): TaskEntity[] {
    const tasksByName = new Map<string, TaskEntity>();
    const dag = new DAG();

    for (const task of tasks) {
      tasksByName.set(task.name, task);

      for (const dependencyName of task.dependsOn) {
        dag.addDependency(task.name, dependencyName);
      }
    }

    return Array.from(dag.getAllDependents(taskName)).map((x) => tasksByName.get(x));
  }
}
