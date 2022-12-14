import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto, CreateTasksDto, RunStatus, TaskStatus } from '@tskmgr/common';
import { Run } from '../runs/run.entity';
import { PullRequest } from '../pull-requests/pull-request.entity';

@Injectable()
export class TasksService {
  public constructor(
    @InjectRepository(Task) private readonly tasksRepository: Repository<Task>,
    @InjectRepository(Run) private readonly runsRepository: Repository<Run>
  ) {}

  /**
   * Create new tasks in bulk
   */
  async createTasks(runId: number, createTasksDto: CreateTasksDto): Promise<Task[]> {
    const run = await this.runsRepository.findOneBy({ id: runId });

    if (!run) {
      throw new Error(`Run not found`);
    }

    if (run.closed) {
      throw new Error(`Closed run can't accept new tasks`);
    }

    if (run.endedAt) {
      throw new Error(`Run with ${run.status} status can't accept new tasks`);
    }

    const tasks: Task[] = [];
    const hasRunnerAffinity = await this.hasRunnerAffinity(run);

    for (const createTaskDto of createTasksDto.tasks) {
      const avgDuration = await this.getAvgDuration(createTaskDto);

      const task = this.tasksRepository.create({
        run: run,
        name: createTaskDto.name,
        type: createTaskDto.type,
        command: createTaskDto.command,
        arguments: createTaskDto.arguments,
        options: createTaskDto.options,
        priority: createTaskDto.priority,
        avgDuration: avgDuration,
      });

      if (hasRunnerAffinity) {
        task.runnerId = await this.getRunnerAffinityId(run.pullRequest, createTaskDto);
      }

      tasks.push(task);
    }

    if (run.status === RunStatus.Created) {
      run.status = RunStatus.Started;
      await this.runsRepository.save(run);
    }

    return this.tasksRepository.save(tasks);
  }

  private async hasRunnerAffinity(run: Run): Promise<boolean> {
    if (!run.affinity) {
      return false;
    }

    // TODO: check if it's possible to assign without pull request
    if (!run.pullRequest) {
      return false;
    }

    await this.getPreviousPullRequestRun(run);
  }

  private async getPreviousPullRequestRun(run: Run): Promise<Run> {
    return this.runsRepository.findOne({
      where: {
        id: Not(run.id),
        pullRequest: { id: run.pullRequest.id },
        status: RunStatus.Completed,
        runners: run.runners,
      },
      order: { endedAt: 'DESC' },
    });
  }

  private async getAvgDuration(createTaskDto: CreateTaskDto): Promise<number> {
    const previousTasks = await this.tasksRepository.find({
      where: {
        type: createTaskDto.type,
        command: createTaskDto.command,
        arguments: In(createTaskDto.arguments || []),
        options: createTaskDto.options,
        status: TaskStatus.Completed,
        cached: false,
      },
      order: { endedAt: 'DESC' },
      take: 25, // TODO: make it configurable
    });

    const sum = previousTasks.reduce((p, c) => p + c.duration, 0);
    return sum / previousTasks.length || undefined;
  }

  private async getRunnerAffinityId(pullRequest: PullRequest, createTaskDto: CreateTaskDto): Promise<string> {
    const task = await this.tasksRepository.findOne({
      where: {
        run: { pullRequest: { id: pullRequest.id } },
        runnerId: Not(IsNull()),
        status: TaskStatus.Completed,
        type: createTaskDto.type,
        command: createTaskDto.command,
        arguments: In(createTaskDto.arguments || []),
        options: createTaskDto.options,
      },
      order: { endedAt: 'DESC' },
    });

    return task?.runnerId;
  }
}
