import { Injectable, NotImplementedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument } from './schemas/task.schema';
import { Build, BuildDocument } from '../builds/schemas/build.schema';
import { BuildsService } from '../builds/builds.service';
import { PullRequest } from '../builds/schemas/pull-request.schema';
import { BuildStatus, CompleteTaskDto, CreateTaskDto, CreateTasksDto, DateUtil, StartTaskResponseDto, TaskStatus } from '@tskmgr/common';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    @InjectModel(Build.name) private readonly buildModel: Model<BuildDocument>,
    private readonly buildsService: BuildsService
  ) {}

  /**
   * Create new tasks in bulk
   * @param buildId
   * @param createTasksDto
   */
  async createTasks(buildId: string, createTasksDto: CreateTasksDto): Promise<Task[]> {
    const build = await this.buildModel.findById(buildId).populate('pullRequest').exec();
    if (!build) throw new Error(`Build id: ${buildId} can't be found.`);

    if (build.status === BuildStatus.Closed || build.endedAt) {
      throw new Error(`Build with ${build.status} status can't accept new tasks`);
    }

    const tasks: Promise<Task>[] = [];
    for (const createTaskDto of createTasksDto.tasks) {
      const avgDuration = await this.getAvgDuration(createTaskDto);
      const runnerId = await this.getPreviousRunnerId(build.pullRequest, createTaskDto);
      const task: Partial<Task> = {
        build: build._id,
        pullRequest: build.pullRequest,
        avgDuration: avgDuration,
        runnerId: runnerId,
        name: createTaskDto.name,
        type: createTaskDto.type,
        command: createTaskDto.command,
        arguments: createTaskDto.arguments,
        options: createTaskDto.options,
      };
      tasks.push(this.taskModel.create(task));
    }

    if (build.status === BuildStatus.Created) {
      build.status = BuildStatus.Started;
      await build.save();
    }

    return Promise.all(tasks);
  }

  async findByBuildId(buildId: string): Promise<Task[]> {
    return this.taskModel
      .find({ build: { _id: buildId } })
      .sort({ createdAt: -1 })
      .limit(500)
      .exec();
  }

  /**
   * Get and start one pending task
   * @param buildId
   * @param runnerId
   * @param hostname
   */
  async findOnePendingTask(buildId: string, runnerId: string, runnerHost: string): Promise<StartTaskResponseDto> {
    const build = await this.buildModel.findById(buildId).exec();
    if (!build) throw new Error(`Build id: ${buildId} can't be found.`);

    if (build.endedAt) {
      return { continue: false, task: null };
    }

    const startedTask =
      (await this.getPendingTaskP1(buildId, runnerId, runnerHost)) || (await this.getPendingTaskP2(buildId, runnerId, runnerHost));

    if (!startedTask) {
      const canTakeNewTask = !(build.status === BuildStatus.Closed);
      return { continue: canTakeNewTask, task: null };
    }

    return { continue: true, task: startedTask };
  }

  /**
   * Complete existing task
   * @param taskId
   * @param cached
   */
  async complete(taskId: string, completeTaskDto: CompleteTaskDto): Promise<Task> {
    const { cached } = completeTaskDto;
    const task = await this.taskModel.findOne({ _id: taskId }).populate('build').exec();
    if (!task) throw new Error(`Task id: ${taskId} can't be found.`);

    if (!task.startedAt || task.endedAt) {
      throw new NotImplementedException(`Task with ${task.status} status can't change to ${TaskStatus.Completed}`);
    }

    const endedAt = new Date();
    task.endedAt = endedAt;
    task.status = TaskStatus.Completed;
    task.duration = DateUtil.getDuration(task.startedAt, endedAt);
    task.cached = cached;
    await task.save();

    if (task.build.status === BuildStatus.Closed) {
      if (await this.buildsService.hasAllTasksCompleted(task.build)) {
        await task.build.complete().save();
      }
    }

    return task;
  }

  async fail(taskId: string): Promise<Task> {
    const task = await this.taskModel.findOne({ _id: taskId }).populate('build').exec();
    if (!task) throw new Error(`Task id: ${taskId} can't be found.`);

    if (!task.startedAt || task.endedAt) {
      throw new NotImplementedException(`Task with ${task.status} status can't change to ${TaskStatus.Failed}`);
    }

    const endedAt = new Date();
    task.endedAt = endedAt;
    task.status = TaskStatus.Failed;
    task.duration = DateUtil.getDuration(task.startedAt, endedAt);

    await task.build.abort().save();
    return task.save();
  }

  private async getPendingTaskP1(buildId: string, runnerId: string, runnerHost: string): Promise<Task> {
    return this.taskModel
      .findOneAndUpdate(
        {
          build: { _id: buildId },
          status: TaskStatus.Pending,
          $or: [{ runnerId: runnerId }, { runnerId: { $exists: false } }],
        },
        { $set: { startedAt: new Date(), status: TaskStatus.Started, runnerId: runnerId, runnerHost: runnerHost } },
        { new: true }
      )
      .sort({ avgDuration: -1 }) // prioritize task with >> average duration first.
      .exec();
  }

  private async getPendingTaskP2(buildId: string, runnerId: string, runnerHost: string): Promise<Task> {
    return this.taskModel
      .findOneAndUpdate(
        {
          build: { _id: buildId },
          status: TaskStatus.Pending,
          runnerId: { $ne: runnerId },
        },
        { $set: { startedAt: new Date(), status: TaskStatus.Started, runnerId: runnerId, runnerHost: runnerHost } },
        { new: true }
      )
      .sort({ avgDuration: -1 }) // prioritize task with >> average duration first.
      .exec();
  }

  private async getAvgDuration(createTaskDto: CreateTaskDto): Promise<number> {
    const previousTasks = await this.taskModel
      .find({
        type: createTaskDto.type,
        command: createTaskDto.command,
        arguments: createTaskDto.arguments || [],
        options: createTaskDto.options,
        status: TaskStatus.Completed,
        cached: { $ne: true }, // do not account cached tasks in the average
      })
      .sort({ endedAt: -1 })
      .limit(25)
      .exec();

    const sum = previousTasks.reduce((p, c) => p + c.duration, 0);
    return sum / previousTasks.length || undefined;
  }

  private async getPreviousRunnerId(pullRequest: PullRequest, createTaskDto: CreateTaskDto): Promise<string> {
    const task = await this.taskModel
      .findOne({
        pullRequest: pullRequest._id,
        runnerId: { $exists: true },
        status: TaskStatus.Completed,
        type: createTaskDto.type,
        command: createTaskDto.command,
        arguments: createTaskDto.arguments || [],
        options: createTaskDto.options,
      })
      .sort({ endedAt: -1 })
      .exec();

    return task?.runnerId;
  }
}
