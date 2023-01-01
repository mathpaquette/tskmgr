import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import { TaskEntity } from './task.entity';
import {
  CreateTaskDto,
  CreateTasksDto,
  RunStatus,
  TaskStatus,
  CreateFileRequestDto,
  CompleteTaskDto,
} from '@tskmgr/common';
import { RunEntity } from '../runs/run.entity';
import { FileEntity } from '../files/file.entity';
import { Express } from 'express';

@Injectable()
export class TasksService {
  public constructor(
    @InjectRepository(TaskEntity) private readonly tasksRepository: Repository<TaskEntity>,
    @InjectRepository(RunEntity) private readonly runsRepository: Repository<RunEntity>,
    @InjectRepository(FileEntity) private readonly filesRepository: Repository<FileEntity>
  ) {}
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

  async completeTask(taskId: number, completeTaskDto: CompleteTaskDto): Promise<TaskEntity> {
    const task = await this.tasksRepository.findOne({
      where: { id: taskId },
      relations: { run: true },
    });

    if (!task) {
      throw new Error(`Task id: ${taskId} can't be found.`);
    }

    const { cached } = completeTaskDto;
    task.complete(cached);
    await this.tasksRepository.save(task);
    await this.updateRunStatus(task.run);
    return task;
  }

  async fail(taskId: number): Promise<TaskEntity> {
    const task = await this.tasksRepository.findOne({
      where: { id: taskId },
      relations: { run: true },
    });

    if (!task) {
      throw new Error(`Task id: ${taskId} can't be found.`);
    }

    task.fail();
    await this.tasksRepository.save(task);
    await this.updateRunStatus(task.run);
    return task;
  }

  async createFile(
    taskId: number,
    file: Express.Multer.File,
    createFileRequestDto: CreateFileRequestDto
  ): Promise<FileEntity> {
    const task = await this.tasksRepository.findOneBy({ id: taskId });
    if (!task) {
      throw new Error(`Unable run find task id: ${taskId}`);
    }

    const fileEntity = this.filesRepository.create({
      task: task,
      type: createFileRequestDto.type,
      description: createFileRequestDto.description,
      originName: file.originalname,
      filename: file.filename,
      mimeType: file.mimetype,
    });

    return this.filesRepository.save(fileEntity);
  }

  private async updateRunStatus(run: RunEntity): Promise<RunEntity> {
    const allTasks = await this.tasksRepository.find({
      where: { run: { id: run.id } },
    });
    const endedTasks = allTasks.filter((x) => x.endedAt);
    const failedTasks = allTasks.filter((x) => x.status === TaskStatus.Failed);

    if (run.failFast && failedTasks.length > 0) {
      run.fail();
    }

    if (run.closed && allTasks.length === endedTasks.length) {
      if (failedTasks.length > 0) {
        run.fail();
      } else {
        run.complete();
      }
    }

    return this.runsRepository.save(run);
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
