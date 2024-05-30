import { Injectable } from '@nestjs/common';
import { StartTaskDto, StartTaskResponseDto, TaskPriority, TaskStatus } from '@tskmgr/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskEntity } from './task.entity';
import { DataSource, EntityManager, IsNull, Repository } from 'typeorm';
import { RunEntity } from '../runs/run.entity';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { FindOneOptions } from 'typeorm/find-options/FindOneOptions';

@Injectable()
export class PendingTasksService {
  constructor(
    @InjectRepository(TaskEntity) private readonly tasksRepository: Repository<TaskEntity>,
    @InjectRepository(RunEntity) private readonly runsRepository: Repository<RunEntity>,
    private dataSource: DataSource
  ) {}

  /**
   * Get and start one pending task
   */
  async startPendingTask(runId: number, startTaskDto: StartTaskDto): Promise<StartTaskResponseDto> {
    return await this.dataSource.transaction(async (manager) => {
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

      const startedTask = await this.getPendingTask(manager, runId, startTaskDto, run.prioritization);
      if (!startedTask) {
        const waitingForTasks = !run.closed; // until run is closed, we need to wait for new incoming tasks.
        return { continue: waitingForTasks, run };
      }

      return { continue: true, run, task: startedTask };
    });
  }

  private async getPendingTask(
    manager: EntityManager,
    runId: number,
    startTaskDto: StartTaskDto,
    prioritization: TaskPriority[]
  ): Promise<TaskEntity> {
    for (const priority of prioritization) {
      let task: TaskEntity;

      switch (priority) {
        case TaskPriority.Longest:
          task = await this.startOnePendingTask(manager, startTaskDto, this.getLongestOptions(runId));
          break;
        case TaskPriority.Shortest:
          task = await this.startOnePendingTask(manager, startTaskDto, this.getShortestOptions(runId));
          break;
        case TaskPriority.Newest:
          task = await this.startOnePendingTask(manager, startTaskDto, this.getNewestOptions(runId));
          break;
        case TaskPriority.Oldest:
          task = await this.startOnePendingTask(manager, startTaskDto, this.getOldestOptions(runId));
          break;
        default:
          throw Error('Unknown priority type!');
      }

      if (task) {
        return task;
      }
    }

    return null;
  }

  private getLongestOptions(runId: number): FindOneOptions<TaskEntity> {
    return {
      where: {
        run: { id: runId },
        status: TaskStatus.Pending,
        priority: TaskPriority.Longest,
      },
      order: { avgDuration: 'DESC' },
      lock: {
        mode: 'pessimistic_write',
        tables: ['task'],
      },
    };
  }

  private getShortestOptions(runId: number): FindOneOptions<TaskEntity> {
    return {
      where: {
        run: { id: runId },
        status: TaskStatus.Pending,
        priority: TaskPriority.Shortest,
      },
      order: { avgDuration: 'ASC' },
      lock: {
        mode: 'pessimistic_write',
        tables: ['task'],
      },
    };
  }

  // FIFO
  private getNewestOptions(runId: number): FindOneOptions<TaskEntity> {
    return {
      where: {
        run: { id: runId },
        status: TaskStatus.Pending,
        priority: TaskPriority.Newest,
      },
      order: { createdAt: 'DESC' },
      lock: {
        mode: 'pessimistic_write',
        tables: ['task'],
      },
    };
  }

  // LIFO
  private getOldestOptions(runId: number): FindOneOptions<TaskEntity> {
    return {
      where: {
        run: { id: runId },
        status: TaskStatus.Pending,
        priority: TaskPriority.Oldest,
      },
      order: { createdAt: 'ASC' },
      lock: {
        mode: 'pessimistic_write',
        tables: ['task'],
      },
    };
  }

  private async startOnePendingTask(
    manager: EntityManager,
    startTaskDto: StartTaskDto,
    options: FindOneOptions<TaskEntity>
  ): Promise<TaskEntity> {
    const { runnerId, runnerInfo } = startTaskDto;
    const task = await manager.findOne(TaskEntity, options);

    if (!task) {
      return;
    }

    task.start(runnerId, runnerInfo);
    await manager.save(task);

    return task;
  }
}
