import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { TaskEntity } from './task.entity';
import {
  CompleteTaskDto,
  CreateFileRequestDto,
  CreateTaskDto,
  CreateTasksDto,
  RunStatus,
  TaskStatus,
} from '@tskmgr/common';
import { RunEntity } from '../runs/run.entity';
import { FileEntity } from '../files/file.entity';
import { Express } from 'express';
import { DependentProjectEntity } from './dependent-project.entity';

@Injectable()
export class TasksService {
  public constructor(
    @InjectRepository(TaskEntity) private readonly tasksRepository: Repository<TaskEntity>,
    @InjectRepository(RunEntity) private readonly runsRepository: Repository<RunEntity>,
    @InjectRepository(FileEntity) private readonly filesRepository: Repository<FileEntity>,
    @InjectRepository(DependentProjectEntity) private readonly dependentRepository: Repository<DependentProjectEntity>,
    private dataSource: DataSource
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

    const hasAffinity = run.affinity;
    const tasks: TaskEntity[] = [];

    for (const createTaskDto of createTasksDto.tasks) {
      const avgDuration = await this.getAverageTaskDuration(createTaskDto);

      const dependencies =
        createTaskDto.dependsOn?.map((dependencyDto) => {
          return this.dependentRepository.create({
            project: dependencyDto.project,
            target: dependencyDto.target,
          });
        }) ?? [];

      const task = this.tasksRepository.create({
        run: run,
        name: createTaskDto.name,
        type: createTaskDto.type,
        command: createTaskDto.command,
        arguments: createTaskDto.arguments,
        options: createTaskDto.options,
        priority: createTaskDto.priority,
        dependsOn: dependencies,
        avgDuration: avgDuration,
      });

      if (hasAffinity) {
        task.runnerId = await this.getRunnerIdFromAffinity(run, createTaskDto);
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

  /**
   * If failFast enabled, set all running tasks to abort status.
   * @param taskId
   */
  async failTask(taskId: number): Promise<TaskEntity> {
    const task = await this.dataSource.transaction(async (manager) => {
      const task = await manager.findOne(TaskEntity, {
        where: { id: taskId },
        relations: { run: true },
        lock: {
          mode: 'pessimistic_write',
          tables: ['task'],
        },
      });

      if (!task) {
        throw new Error(`Task id: ${taskId} can't be found.`);
      }

      // if failFast enabled, abort all tasks from the run
      if (task.run.failFast) {
        const runningTasks = await manager.findBy(TaskEntity, {
          run: { id: task.run.id },
          status: TaskStatus.Running,
        });

        for (const runningTask of runningTasks) {
          runningTask.abort();
        }

        await manager.save(runningTasks);
      }

      task.fail();
      await manager.save(task);

      return task;
    });

    await this.updateRunStatus(task.run);
    return task;
  }

  async createFile(
    taskId: number,
    file: Express.Multer.File,
    createFileRequestDto: CreateFileRequestDto
  ): Promise<FileEntity> {
    const task = await this.tasksRepository.findOne({ where: { id: taskId }, relations: { run: true } });
    if (!task) {
      throw new Error(`Unable run find task id: ${taskId}`);
    }

    const fileEntity = this.filesRepository.create({
      run: task.run,
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
    const allTasks = await this.tasksRepository.find({ where: { run: { id: run.id } } });
    const completedTasks = allTasks.filter((x) => x.status === TaskStatus.Completed);
    const endedTasks = allTasks.filter((x) => x.endedAt);
    const uncompletedTasks = endedTasks.filter((x) => x.status !== TaskStatus.Completed);

    // when fail fast enabled, we fail run as soon as we get one uncompleted task
    if (run.failFast && uncompletedTasks.length > 0) {
      run.fail();
      return this.runsRepository.save(run);
    }

    if (run.closed && allTasks.length === endedTasks.length) {
      if (completedTasks.length === allTasks.length) {
        run.complete();
      } else {
        run.fail();
      }
      return this.runsRepository.save(run);
    }
  }

  private async getAverageTaskDuration(createTaskDto: CreateTaskDto): Promise<number> {
    const previousTasks = await this.tasksRepository.find({
      where: {
        type: createTaskDto.type,
        command: createTaskDto.command,
        arguments: createTaskDto.arguments?.toString(),
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

  private async getRunnerIdFromAffinity(run: RunEntity, createTaskDto: CreateTaskDto): Promise<string> {
    const task = await this.tasksRepository.findOne({
      where: {
        run: {
          affinity: true,
          parameters: run.parameters || {}, // must match all parameters from current run
        },
        status: TaskStatus.Completed,
        type: createTaskDto.type,
        command: createTaskDto.command,
        arguments: createTaskDto.arguments?.toString(),
        options: createTaskDto.options,
        // TODO: maximum one month old to limit scan
      },
      relations: { run: true },
      order: { endedAt: 'DESC' },
    });

    return task?.runnerId;
  }
}
