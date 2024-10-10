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
      return await this.dataSource.transaction(async (manager) => {
        const { runnerId, runnerInfo } = startTaskDto;
        run = await manager.findOne(RunEntity, { where: { id: runId } });

        if (!run) {
          throw new Error(`Run id: ${runId} can't be found.`);
        }

        for (const priority of run.prioritization) {
          if (!Object.values(TaskPriority).includes(priority)) {
            throw new Error('Unknown priority type!');
          }
        }

        if (run.hasEnded()) {
          return { continue: false, run };
        }

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
   * Constructs the options for finding a task entity.
   *
   *   @param params - An object containing the parameters for the find operation.
   *   @param params.runId - The ID of the run.
   *   @param params.priority - The priority of the task.
   *   @param params.taskStatus - The status of the task.
   *   @param params.taskName - Optional. The name of the task.
   *   @param params.exclude - Optional. An array of task IDs to exclude from the search.
   *
   *   @returns An object containing the options for the find operation.
   */
  private getOptions(params: {
    runId: number;
    priority?: TaskPriority;
    taskStatus?: TaskStatus;
    taskName?: string;
    exclude?: number[];
  }): FindOneOptions<TaskEntity> {
    const { runId, priority, taskStatus, taskName, exclude = [] } = params;
    // Set the order based on the priority
    let order;
    switch (priority) {
      case TaskPriority.Longest:
        order = { avgDuration: 'DESC' };
        break;
      case TaskPriority.Shortest:
        order = { avgDuration: 'ASC' };
        break;
      case TaskPriority.Newest:
        order = { createdAt: 'DESC' }; // FIFO
        break;
      case TaskPriority.Oldest:
        order = { createdAt: 'ASC' }; // LIFO
    }

    return {
      where: {
        run: { id: runId },
        name: taskName,
        status: taskStatus,
        id: Not(In(exclude)),
      },
      order: order,
      lock: {
        mode: 'pessimistic_write',
        tables: ['task'],
      },
    };
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
