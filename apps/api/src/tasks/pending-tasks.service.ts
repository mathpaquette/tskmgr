import { Injectable } from '@nestjs/common';
import { StartTaskDto, StartTaskResponseDto, TaskPriority, TaskStatus } from '@tskmgr/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskEntity } from './task.entity';
import { Repository } from 'typeorm';
import { RunEntity } from '../runs/run.entity';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';

@Injectable()
export class PendingTasksService {
  constructor(
    @InjectRepository(TaskEntity) private readonly tasksRepository: Repository<TaskEntity>,
    @InjectRepository(RunEntity) private readonly runsRepository: Repository<RunEntity>
  ) {}

  /**
   * Get and start one pending task
   */
  async startPendingTask(runId: number, startTaskDto: StartTaskDto): Promise<StartTaskResponseDto> {
    // TODO: need a transaction

    const run = await this.runsRepository.findOneBy({ id: runId });
    if (!run) {
      throw new Error(`Run id: ${runId} can't be found.`);
    }

    if (run.hasEnded()) {
      return {
        continue: false,
        run,
      };
    }

    const startedTask = await this.getPendingTask(runId, startTaskDto, run.prioritization);
    if (!startedTask) {
      const waitingForTasks = !run.closed;
      return { continue: waitingForTasks, run };
    }

    return {
      continue: true,
      run,
      task: startedTask,
    };
  }

  private async getPendingTask(runId: number, startTaskDto: StartTaskDto, prioritization: TaskPriority[]) {
    for (const priority of prioritization) {
      let task: TaskEntity;

      switch (priority) {
        case TaskPriority.Longest:
          task = await this.getPendingTaskLongest(runId, startTaskDto);
          break;
        case TaskPriority.Shortest:
          task = await this.getPendingTaskShortest(runId, startTaskDto);
          break;
        case TaskPriority.Newest:
          task = await this.getPendingTaskNewest(runId, startTaskDto);
          break;
        case TaskPriority.Oldest:
          task = await this.getPendingTaskOldest(runId, startTaskDto);
          break;
        default:
          throw Error('Unknown priority type!');
      }

      if (task) {
        const { runnerId, runnerInfo } = startTaskDto;
        task.start(runnerId, runnerInfo);
        return this.tasksRepository.save(task);
      }
    }

    return null;
  }

  private async getPendingTaskLongest(runId: number, startTaskDto: StartTaskDto): Promise<TaskEntity> {
    const { runnerId } = startTaskDto;
    const query: FindOptionsWhere<TaskEntity> = {
      run: { id: runId },
      status: TaskStatus.Pending,
      priority: TaskPriority.Longest,
    };

    return this.tasksRepository.findOne({
      where: [{ ...query, runnerId }, query],
      order: { avgDuration: 'DESC' },
    });
  }

  private async getPendingTaskShortest(runId: number, startTaskDto: StartTaskDto): Promise<TaskEntity> {
    const { runnerId } = startTaskDto;
    const query: FindOptionsWhere<TaskEntity> = {
      run: { id: runId },
      status: TaskStatus.Pending,
      priority: TaskPriority.Shortest,
    };

    return this.tasksRepository.findOne({
      where: [{ ...query, runnerId }, query],
      order: { avgDuration: 'ASC' },
    });
  }

  // FIFO
  private async getPendingTaskOldest(runId: number, startTaskDto: StartTaskDto): Promise<TaskEntity> {
    const { runnerId } = startTaskDto;
    const query: FindOptionsWhere<TaskEntity> = {
      run: { id: runId },
      status: TaskStatus.Pending,
      priority: TaskPriority.Oldest,
    };

    return this.tasksRepository.findOne({
      where: [{ ...query, runnerId }, query],
      order: { createdAt: 'ASC' },
    });
  }

  // LIFO
  private async getPendingTaskNewest(runId: number, startTaskDto: StartTaskDto): Promise<TaskEntity> {
    const { runnerId } = startTaskDto;
    const query: FindOptionsWhere<TaskEntity> = {
      run: { id: runId },
      status: TaskStatus.Pending,
      priority: TaskPriority.Newest,
    };

    return this.tasksRepository.findOne({
      where: [{ ...query, runnerId }, query],
      order: { createdAt: 'DESC' },
    });
  }
}
