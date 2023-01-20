import { Injectable } from '@nestjs/common';
import { StartTaskDto, StartTaskResponseDto, TaskPriority, TaskStatus } from '@tskmgr/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskEntity } from './task.entity';
import { DataSource, IsNull, Repository } from 'typeorm';
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
    const run = await this.runsRepository.findOneBy({ id: runId });
    if (!run) {
      throw new Error(`Run id: ${runId} can't be found.`);
    }

    if (run.hasEnded()) {
      return { continue: false, run };
    }

    const startedTask = await this.getPendingTask(runId, startTaskDto, run.prioritization);
    if (!startedTask) {
      const waitingForTasks = !run.closed; // until run is closed, we need to wait for new incoming tasks.
      return { continue: waitingForTasks, run };
    }

    return { continue: true, run, task: startedTask };
  }

  private async getPendingTask(
    runId: number,
    startTaskDto: StartTaskDto,
    prioritization: TaskPriority[]
  ): Promise<TaskEntity> {
    for (const priority of prioritization) {
      let task: TaskEntity;

      switch (priority) {
        case TaskPriority.Longest:
          task = await this.startOnePendingTask(startTaskDto, this.getLongestOptions(runId, startTaskDto));
          break;
        case TaskPriority.Shortest:
          task = await this.startOnePendingTask(startTaskDto, this.getShortestOptions(runId, startTaskDto));
          break;
        case TaskPriority.Newest:
          task = await this.startOnePendingTask(startTaskDto, this.getNewestOptions(runId, startTaskDto));
          break;
        case TaskPriority.Oldest:
          task = await this.startOnePendingTask(startTaskDto, this.getOldestOptions(runId, startTaskDto));
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

  private getLongestOptions(runId: number, startTaskDto: StartTaskDto): FindOneOptions<TaskEntity> {
    const { runnerId } = startTaskDto;
    const query: FindOptionsWhere<TaskEntity> = {
      run: { id: runId },
      status: TaskStatus.Pending,
      priority: TaskPriority.Longest,
    };

    return {
      where: [
        { ...query, runnerId },
        { ...query, runnerId: IsNull() },
      ],
      order: { avgDuration: 'DESC' },
      lock: {
        mode: 'pessimistic_write',
        tables: ['task'],
      },
    };
  }

  private getShortestOptions(runId: number, startTaskDto: StartTaskDto): FindOneOptions<TaskEntity> {
    const { runnerId } = startTaskDto;
    const query: FindOptionsWhere<TaskEntity> = {
      run: { id: runId },
      status: TaskStatus.Pending,
      priority: TaskPriority.Shortest,
    };

    return {
      where: [
        { ...query, runnerId },
        { ...query, runnerId: IsNull() },
      ],
      order: { avgDuration: 'ASC' },
      lock: {
        mode: 'pessimistic_write',
        tables: ['task'],
      },
    };
  }

  // FIFO
  private getNewestOptions(runId: number, startTaskDto: StartTaskDto): FindOneOptions<TaskEntity> {
    const { runnerId } = startTaskDto;
    const query: FindOptionsWhere<TaskEntity> = {
      run: { id: runId },
      status: TaskStatus.Pending,
      priority: TaskPriority.Newest,
    };

    return {
      where: [
        { ...query, runnerId },
        { ...query, runnerId: IsNull() },
      ],
      order: { createdAt: 'DESC' },
      lock: {
        mode: 'pessimistic_write',
        tables: ['task'],
      },
    };
  }

  // LIFO
  private getOldestOptions(runId: number, startTaskDto: StartTaskDto): FindOneOptions<TaskEntity> {
    const { runnerId } = startTaskDto;
    const query: FindOptionsWhere<TaskEntity> = {
      run: { id: runId },
      status: TaskStatus.Pending,
      priority: TaskPriority.Oldest,
    };

    return {
      where: [
        { ...query, runnerId },
        { ...query, runnerId: IsNull() },
      ],
      order: { createdAt: 'ASC' },
      lock: {
        mode: 'pessimistic_write',
        tables: ['task'],
      },
    };
  }

  private async startOnePendingTask(
    startTaskDto: StartTaskDto,
    options: FindOneOptions<TaskEntity>
  ): Promise<TaskEntity> {
    const { runnerId, runnerInfo } = startTaskDto;
    return await this.dataSource.transaction(async (manager) => {
      const task = await manager.findOne(TaskEntity, options);

      if (!task) return;

      task.start(runnerId, runnerInfo);
      await manager.save(task);

      return task;
    });
  }
}
