import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { TaskEntity } from './task.entity';
import { CompleteTaskDto, CreateFileRequestDto, CreateTasksDto, RunStatus, TaskStatus } from '@tskmgr/common';
import { RunEntity } from '../runs/run.entity';
import { FileEntity } from '../files/file.entity';
import { DagService } from './dag.service';
import { HashService } from '../utils/hash.service';
import { TasksRepository } from './tasks.repository';

@Injectable()
export class TasksService {
  public constructor(
    private readonly tasksRepository: TasksRepository,
    @InjectRepository(RunEntity) private readonly runsRepository: Repository<RunEntity>,
    @InjectRepository(FileEntity) private readonly filesRepository: Repository<FileEntity>,
    private readonly dataSource: DataSource,
    private readonly dagService: DagService,
    private readonly hashService: HashService
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
    const hashes: string[] = [];

    for (const dto of createTasksDto.tasks) {
      const task = this.tasksRepository.create({
        run: run,
        name: dto.name,
        type: dto.type,
        command: dto.command,
        arguments: dto.arguments,
        options: dto.options,
        priority: dto.priority,
        dependencies: dto.dependencies,
      });
      task.hash = this.getHashForTask(task);
      tasks.push(task);
      hashes.push(task.hash);
    }

    const avgDurationsByHash = await this.tasksRepository.getAvgDurationsByHash(hashes);
    for (const task of tasks) {
      task.avgDuration = avgDurationsByHash.get(task.hash);
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

    if (!cached) {
      await this.tasksRepository.save(task);
      task.avgDuration = await this.tasksRepository.calculateAvgTaskDuration(task.hash);
    }

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

      // get all tasks from the run
      const tasks = await manager.find(TaskEntity, { where: { run: { id: task.run.id } } });

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

      const failedTask = task.fail();
      const cancelledDependantTasks = this.dagService.getDependantTasks(task.name, tasks).map((x) =>
        // TODO: replace ABORT by a new CANCELLED task status
        x.abort()
      );

      if (cancelledDependantTasks.length > 0) {
        Logger.debug(
          `Failed task: ${task.name} from run: ${task.run.id} has dependent tasks: ${cancelledDependantTasks
            .map((x) => x.name)
            .join(',')}`
        );
      }

      await manager.save([failedTask, ...cancelledDependantTasks]);

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

  private getHashForTask(task: TaskEntity): string {
    return this.hashService.generateHash({
      command: task.command ?? null,
      arguments: task.arguments ?? null,
      options: task.options ?? null,
    });
  }
}
