import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StartTaskDto, StartTaskResponseDto, TaskPriority, TaskStatus } from '@tskmgr/common';
import { TaskEntity } from './task.entity';
import { EntityManager, Repository } from 'typeorm';
import { RunEntity } from '../runs/run.entity';
import { DAG } from './dag';

@Injectable()
export class PendingTasksService {
  constructor(@InjectRepository(RunEntity) private readonly runsRepository: Repository<RunEntity>) {}

  /**
   * Get and start one pending task
   */
  async startPendingTask(runId: number, startTaskDto: StartTaskDto): Promise<StartTaskResponseDto> {
    let run: RunEntity;

    try {
      return await this.runsRepository.manager.transaction(async (manager) => {
        run = await manager.findOne(RunEntity, {
          where: { id: runId },
        });

        if (!run) {
          throw new Error(`Run id: ${runId} can't be found.`);
        }

        if (run.hasEnded()) {
          return { continue: false, run };
        }

        const allTasks = await manager.find(TaskEntity, {
          where: { run: { id: run.id } },
          lock: { mode: 'pessimistic_write' },
        });

        // TODO: this part could be cached to avoid calculation
        const tasksByName = new Map<string, TaskEntity>();
        const dag = new DAG();

        for (const task of allTasks) {
          tasksByName.set(task.name, task);

          for (const dependency of task.dependencies) {
            dag.addDependency(dependency, task.name);
          }
        }

        // TODO: could be optimized to avoid multiple visits
        const pendingTasks = allTasks.filter((x) => x.status === TaskStatus.Pending);
        for (const priority of run.prioritization) {
          const sortedTasks = this.sortByPriority(pendingTasks, priority);
          for (const task of sortedTasks) {
            if (task.dependencies.length === 0) {
              return { continue: true, run, task: await this.startTask(manager, task, startTaskDto) };
            }

            const executionOrder = dag.topologicalSortFrom(task.name);
            for (const taskName of executionOrder) {
              const currentTask = tasksByName.get(taskName);
              if (currentTask.status !== TaskStatus.Pending) {
                continue;
              }

              const allDependenciesCompleted = Array.from(dag.getAllDependencies(taskName))
                .map((x) => tasksByName.get(x))
                .every((x) => x.status === TaskStatus.Completed);

              if (allDependenciesCompleted) {
                return { continue: true, run, task: await this.startTask(manager, currentTask, startTaskDto) };
              }
            }
          }
        }

        return { continue: true, run };
      });
    } catch (error) {
      Logger.error('startPendingTask:', error);
      return { continue: true, run };
    }
  }

  private sortByPriority(tasks: TaskEntity[], priority: TaskPriority): TaskEntity[] {
    if (priority === TaskPriority.Longest) {
      // Sort tasks by avgDuration descending
      return tasks.filter((x) => x.priority === priority).sort((a, b) => (b.avgDuration ?? 0) - (a.avgDuration ?? 0));
    }

    if (priority === TaskPriority.Shortest) {
      // Sort tasks by avgDuration ascending
      return tasks.filter((x) => x.priority === priority).sort((a, b) => (a.avgDuration ?? 0) - (b.avgDuration ?? 0));
    }

    if (priority === TaskPriority.Newest) {
      // Sort tasks by id descending (FIFO)
      return tasks.filter((x) => x.priority === priority).sort((a, b) => b.id - a.id);
    }

    if (priority === TaskPriority.Oldest) {
      // Sort tasks by id ascending (LIFO)
      return tasks.filter((x) => x.priority === priority).sort((a, b) => a.id - b.id);
    }

    throw new Error(`Unknown TaskPriority: ${priority}`);
  }

  private async startTask(manager: EntityManager, task: TaskEntity, startTaskDto: StartTaskDto): Promise<TaskEntity> {
    const { runnerId, runnerInfo } = startTaskDto;

    if (!task) {
      return;
    }

    task.start(runnerId, runnerInfo);
    await manager.save(task);

    return task;
  }
}
