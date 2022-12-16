import {Body, Injectable, Post, UploadedFile, UseInterceptors} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import { TaskEntity } from './task.entity';
import { CreateTaskDto, CreateTasksDto, RunStatus, TaskStatus, CreateFileRequestDto } from '@tskmgr/common';
import { RunEntity } from '../runs/run.entity';
import {FileEntity} from "../files/file.entity";
import {FileInterceptor} from "@nestjs/platform-express";

@Injectable()
export class TasksService {
  public constructor(
    @InjectRepository(TaskEntity) private readonly tasksRepository: Repository<TaskEntity>,
    @InjectRepository(RunEntity) private readonly runsRepository: Repository<RunEntity>,
    @InjectRepository(FileEntity) private readonly filesRepository: Repository<FileEntity>
  ) {}


  async createFile() {
    const file = this.filesRepository.create({
      originName: 'test',
    })
  }

  /**
   * Create new tasks in bulk
   */
  async createTasks(runId: number, createTasksDto: CreateTasksDto): Promise<TaskEntity[]> {
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

    const tasks: TaskEntity[] = [];
    const runAffinity = await this.hasRunAffinity(run);

    for (const createTaskDto of createTasksDto.tasks) {
      const avgDuration = await this.getAverageTaskDuration(createTaskDto);

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

      if (runAffinity) {
        task.runnerId = await this.getRunnerAffinityId(runAffinity, createTaskDto);
      }

      tasks.push(task);
    }

    if (run.status === RunStatus.Created) {
      run.status = RunStatus.Started;
      await this.runsRepository.save(run);
    }

    return this.tasksRepository.save(tasks);
  }

  private async hasRunAffinity(run: RunEntity): Promise<RunEntity> {
    if (!run.affinity) {
      return null;
    }

    if (!run.parameters) {
      return null;
    }

    await this.getPreviousMatchingRun(run);
  }

  private async getPreviousMatchingRun(currentRun: RunEntity): Promise<RunEntity> {
    return this.runsRepository.findOne({
      where: {
        id: Not(currentRun.id),
        parameters: currentRun.parameters,
        status: RunStatus.Completed,
      },
      order: { endedAt: 'DESC' },
    });
  }

  private async getAverageTaskDuration(createTaskDto: CreateTaskDto): Promise<number> {
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

  private async getRunnerAffinityId(run: RunEntity, createTaskDto: CreateTaskDto): Promise<string> {
    const task = await this.tasksRepository.findOne({
      where: {
        run: { id: run.id },
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
