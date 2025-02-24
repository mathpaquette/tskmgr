import { Injectable } from '@nestjs/common';
import { RunnerInfo, StartTaskDto, StartTaskResponseDto, TaskPriority, TaskStatus } from '@tskmgr/common';
import { TaskEntity } from './task.entity';
import { DataSource, EntityManager, In, Not, QueryFailedError } from 'typeorm';
import { RunEntity } from '../runs/run.entity';
import { FindOneOptions } from 'typeorm/find-options/FindOneOptions';

@Injectable()
export class PendingTasksService {
  constructor(private dataSource: DataSource) {}

  /**
   * Get and start one pending task
   */
  async startPendingTask(runId: number, startTaskDto: StartTaskDto): Promise<StartTaskResponseDto> {
    let run: RunEntity;
    try {
      // TODO: add lock we need to acquire lock here
      return await this.dataSource.transaction(async (manager) => {
        const { runnerId, runnerInfo } = startTaskDto;
        run = await manager.findOne(RunEntity, { where: { id: runId } });

        if (!run) {
          throw new Error(`Run id: ${runId} can't be found.`);
        }

        // TODO: move to controller
        for (const priority of run.prioritization) {
          if (!Object.values(TaskPriority).includes(priority)) {
            throw new Error('Unknown priority type!');
          }
        }

        if (run.hasEnded()) {
          return { continue: false, run };
        }

        // get all tasks from the run by priority

        // generate the task model

        // sort tasks by priority

        // check if task can be executed

        const allTasks = await manager.find(TaskEntity, this.getOptions({ runId }));
        const allPendingTasks = allTasks.filter((task) => task.status === TaskStatus.Pending);
        if (allPendingTasks.length === 0) {
          const waitingForTasks = !run.closed; // until run is closed, we need to wait for new incoming tasks.
          return { continue: waitingForTasks, run };
        }

        let pendingTask: TaskEntity;
        for (const taskPriority of run.prioritization) {
          const tasks = allTasks.filter((task) => task.priority === taskPriority);
          const runningPendingTasks = tasks.filter(
            (task) => task.status === TaskStatus.Running || task.status === TaskStatus.Pending
          );
          pendingTask = await this.findTask(runId, manager, runningPendingTasks);
          if (pendingTask) {
            break;
          }
        }

        const startedTask = await this.startTask(manager, runnerId, runnerInfo, pendingTask);

        if (!startedTask) {
          return { continue: true, run };
        }
        return { continue: true, run, task: startedTask };
      });
    } catch (error) {
      if (error instanceof QueryFailedError && error.message.includes('Deadlock detected')) {
        return { continue: true, run };
      } else {
        throw error;
      }
    }
  }

  /**
   * This function is used to find next task to execute.
   * It checks for circular dependencies, whether all dependencies of a task are completed,
   * and if not, it finds the next task that can be executed.
   *
   * @returns The task that can be executed next, or null if no such task is found.
   * @param runId
   * @param priority
   * @param manager
   */
  private async findTask(runId: number, manager: EntityManager, tasks: TaskEntity[]): Promise<TaskEntity> {
    const pendingTasks = tasks.filter((task) => task.status === TaskStatus.Pending);

    if (pendingTasks.length === 0) return null;

    for (const pendingTask of pendingTasks) {
      const nextTask = this.checkDependencies(pendingTask, pendingTasks, tasks);
      if (nextTask) {
        return nextTask;
      }
    }
    return null;
  }

  private checkDependencies(task: TaskEntity, pendingTasks: TaskEntity[], allTasks: TaskEntity[]): TaskEntity {
    if (!task) {
      console.error('Task is not defined. At this point task must be defined');
      return null;
    }

    // Return the task if all its dependencies are completed, or task don't have dependencies
    const isReadyToProceed = task.dependsOn.every((dependencyName) => !allTasks.find((t) => t.name === dependencyName));
    if (isReadyToProceed) {
      return task;
    }

    for (const dependencyName of task.dependsOn) {
      const dependencyTask = allTasks.find((t) => t.name === dependencyName);
      if (dependencyTask?.status !== TaskStatus.Pending) {
        continue;
      }
      if (dependencyTask) {
        const baseDependencyTask = this.checkDependencies(dependencyTask, pendingTasks, allTasks);
        if (baseDependencyTask) {
          return baseDependencyTask;
        }
      }
    }

    return null;
  }

  /**
   * This function is used to start a task. It updates the task status to 'Running' and saves the changes in the database.
   *
   * @param manager - The EntityManager instance.
   * @param runnerId - The ID of the runner.
   * @param runnerInfo - The information about the runner.
   * @param task - The task entity that needs to be started.
   *
   * @returns The updated task entity after it has been started, or undefined if the task is not provided.
   */
  private async startTask(
    manager: EntityManager,
    runnerId: string,
    runnerInfo: RunnerInfo,
    task: TaskEntity
  ): Promise<TaskEntity> {
    if (!task) {
      return;
    }

    task.start(runnerId, runnerInfo);
    await manager.save(task);

    return task;
  }
}
