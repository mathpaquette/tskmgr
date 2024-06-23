import { Injectable } from '@nestjs/common';
import { RunnerInfo, StartTaskDto, StartTaskResponseDto, TaskPriority, TaskStatus } from '@tskmgr/common';
import { TaskEntity } from './task.entity';
import { DataSource, EntityManager, In, Not } from 'typeorm';
import { RunEntity } from '../runs/run.entity';
import { FindOneOptions } from 'typeorm/find-options/FindOneOptions';

@Injectable()
export class PendingTasksService {
  constructor(private dataSource: DataSource) {}

  /**
   * Get and start one pending task
   */
  async startPendingTask(runId: number, startTaskDto: StartTaskDto): Promise<StartTaskResponseDto> {
    return await this.dataSource.transaction(async (manager) => {
      const { runnerId, runnerInfo } = startTaskDto;
      const run = await manager.findOne(RunEntity, {
        where: { id: runId },
        lock: { mode: 'pessimistic_read' },
      });

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

      const pendingTask = await this.getTask(manager, runId, run.prioritization);
      const startedTask = await this.startTask(manager, runnerId, runnerInfo, pendingTask);

      if (!startedTask) {
        // check if there is any task left to run
        const options = this.getOptions({
          runId,
          priority: undefined,
          taskStatus: TaskStatus.Pending,
        });
        const pendingTaskExists = await manager.findOne(TaskEntity, options);
        if (pendingTaskExists) {
          return { continue: true, run };
        }
        const waitingForTasks = !run.closed; // until run is closed, we need to wait for new incoming tasks.
        return { continue: waitingForTasks, run };
      }

      return { continue: true, run, task: startedTask };
    });
  }

  private async getTask(manager: EntityManager, runId: number, prioritization: TaskPriority[]): Promise<TaskEntity> {
    for (const priority of prioritization) {
      const task: TaskEntity = await this.findTask({ manager, runId, priority, searchForNext: true });
      if (task) {
        return task;
      }
    }
    return null;
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
    priority: TaskPriority;
    taskStatus: TaskStatus;
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
        priority: priority,
        id: Not(In(exclude)),
      },
      order: order,
      lock: {
        mode: 'pessimistic_write',
        tables: ['task'],
      },
    };
  }

  // TODO: refactor to fetch all tasks at once
  /**
   * This function is used to find a task based on the provided options.
   * It checks for circular dependencies, whether all dependencies of a task are completed,
   * and if not, it finds the next task that can be executed.
   *
   * @param params - An object containing the parameters for the find operation.
   * @param params.manager - The EntityManager instance.
   * @param params.runId - The ID of the run.
   * @param params.priority - The priority of the task.
   * @param params.task - Optional. The task entity.
   * @param params.seenTasks - Optional. A Map of seen tasks to avoid circular dependencies.
   * @param params.searchForNext - Optional. A boolean to decide whether to search for the next task if the current task is blocked.
   *
   * @returns The task that can be executed next, or null if no such task is found.
   */
  private async findTask(params: {
    manager: EntityManager;
    runId: number;
    priority: TaskPriority;
    task?: TaskEntity;
    seenTasks?: Map<number, string>;
    searchForNext?: boolean;
  }): Promise<TaskEntity> {
    const { manager, runId, priority, seenTasks = new Map(), searchForNext = false } = params;
    let { task } = params;

    // Search for task if it is not provided
    if (!task) {
      task = await manager.findOne(TaskEntity, this.getOptions({ runId, priority, taskStatus: TaskStatus.Pending }));
    }

    // Stop execution if task is not found
    if (!task) {
      return null;
    }

    // Check for circular dependencies
    if (seenTasks.has(task.id)) {
      throw new Error('Circular dependency detected');
    }
    seenTasks.set(task.id, task.name);

    // Return task if it has no dependencies
    if (!task.dependsOn || task.dependsOn.length === 0) {
      return task;
    }

    // Return task if all its dependencies are already completed
    let allDependenciesCompleted = true;
    for (const dependency of task.dependsOn) {
      const options = this.getOptions({
        runId,
        priority,
        taskStatus: TaskStatus.Completed,
        taskName: dependency,
      });
      const dependencyTask = await manager.findOne(TaskEntity, options);

      // If a dependency task is not completed, set the flag to false and break the loop
      if (!dependencyTask) {
        allDependenciesCompleted = false;
        break;
      }
    }
    // If all dependencies are completed, return the task
    if (allDependenciesCompleted) {
      return task;
    }

    // Search for dependency task
    for (const dependency of task.dependsOn) {
      const options = this.getOptions({
        runId,
        priority,
        taskStatus: TaskStatus.Pending,
        taskName: dependency,
      });
      const dependencyTask = await manager.findOne(TaskEntity, options);

      // If dependency task is found, search for the task in it
      if (dependencyTask) {
        return await this.findTask({ manager, runId, priority, task: dependencyTask });
      }
    }

    // If no dependency task is found, it means that at least one of them is in Running state and current task is still blocked,
    // in this case switch to the next pending task.
    if (searchForNext) {
      const options = this.getOptions({
        runId,
        priority,
        taskStatus: TaskStatus.Pending,
        exclude: Array.from(seenTasks.keys()),
      });
      const nextTask = await manager.findOne(TaskEntity, options);
      if (nextTask) {
        return await this.findTask({ manager, runId, priority, task: nextTask, seenTasks, searchForNext });
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
