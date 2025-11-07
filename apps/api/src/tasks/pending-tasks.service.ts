import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RunnerInfo, StartTaskDto, StartTaskResponseDto, TaskPriority, TaskStatus } from '@tskmgr/common';
import { TaskEntity } from './task.entity';
import { DataSource, EntityManager, IsNull, Repository } from 'typeorm';
import { RunEntity } from '../runs/run.entity';
import { FindOneOptions } from 'typeorm/find-options/FindOneOptions';
import { DagService } from './dag.service';
import { DAG } from './dag';

@Injectable()
export class PendingTasksService {
  constructor(
    @InjectRepository(TaskEntity) private readonly tasksRepository: Repository<TaskEntity>,
    @InjectRepository(RunEntity) private readonly runsRepository: Repository<RunEntity>,
    private readonly dagService: DagService
  ) {}

  /**
   * Get and start one pending task
   */
  async startPendingTask(runId: number, startTaskDto: StartTaskDto): Promise<StartTaskResponseDto> {
    console.log('runId:', runId);

    let run: RunEntity;
    try {
      return await this.runsRepository.manager.transaction(async (manager) => {
        const { runnerId, runnerInfo } = startTaskDto;

        const run = await manager.findOne(RunEntity, {
          where: { id: runId },
          lock: { mode: 'pessimistic_read' },
        });

        if (!run) {
          throw new Error(`Run id: ${runId} can't be found.`);
        }

        if (run.hasEnded()) {
          return { continue: false, run };
        }

        const tasks = await manager.find(TaskEntity, {
          where: { run: { id: run.id } },
          lock: { mode: 'pessimistic_write' },
        });

        // TODO: this part could be cached to avoid calculation
        const tasksByName = new Map<string, TaskEntity>();
        const dag = new DAG();

        for (const task of tasks) {
          tasksByName.set(task.name, task);

          for (const dependency of task.dependsOn) {
            dag.addDependency(dependency, task.name);
          }
        }

        const sortedTasks = tasks.sort((a, b) => (b.avgDuration ?? 0) - (a.avgDuration ?? 0)); // Sort tasks by avgDuration descending
        for (const task of sortedTasks) {
          if (task.status !== TaskStatus.Pending) {
            continue;
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

          /*
              const hasFailedDependency = executionOrder
                .map((x) => tasksByName.get(x))
                .some((x) => x.status === TaskStatus.Failed);
              if (hasFailedDependency) {
                continue;
              }*/
        }

        for (const priority of run.prioritization) {
          if (priority === TaskPriority.Longest) {
            //
          }
        }

        return { continue: true, run };
      });
    } catch (error) {
      Logger.error('startPendingTask:', error);
      return { continue: true, run };
    }
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
