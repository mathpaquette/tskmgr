import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument } from './schemas/task.schema';
import { Run, RunDocument } from '../runs/schemas/run.schema';
import { RunsService } from '../runs/runs.service';
import { PullRequest } from '../pull-requests/schemas/pull-request.schema';
import { RunStatus, CompleteTaskDto, CreateTaskDto, CreateTasksDto, StartTaskResponseDto, TaskStatus, TaskPriority } from '@tskmgr/common';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    @InjectModel(Run.name) private readonly runModel: Model<RunDocument>,
    private readonly runsService: RunsService
  ) {}

  /**
   * Create new tasks in bulk
   * @param runId
   * @param createTasksDto
   */
  async createTasks(runId: string, createTasksDto: CreateTasksDto): Promise<Task[]> {
    const run = await this.runModel.findById(runId).populate('pullRequest').exec();
    if (!run) throw new Error(`Run id: ${runId} can't be found.`);

    if (run.closed) {
      throw new Error(`Closed run can't accept new tasks`);
    }

    if (run.endedAt) {
      throw new Error(`Run with ${run.status} status can't accept new tasks`);
    }

    const previousRun = await this.getPreviousRun(run);
    const canAssignRunnerId = run.runnerAffinity && previousRun?.runners === run.runners;

    const tasks: Partial<Task>[] = [];
    for (const createTaskDto of createTasksDto.tasks) {
      const avgDuration = await this.getAvgDuration(createTaskDto);

      const task: Partial<Task> = {
        run: run._id,
        pullRequest: run.pullRequest,
        avgDuration: avgDuration,
        name: createTaskDto.name,
        type: createTaskDto.type,
        command: createTaskDto.command,
        arguments: createTaskDto.arguments,
        options: createTaskDto.options,
      };

      if (canAssignRunnerId) {
        task.runnerId = await this.getPreviousRunnerId(run.pullRequest, createTaskDto);
      }

      tasks.push(task);
    }

    if (run.status === RunStatus.Created) {
      run.status = RunStatus.Started;
      await run.save();
    }

    return this.taskModel.insertMany(tasks);
  }

  async findByRunId(runId: string): Promise<Task[]> {
    return this.taskModel
      .find({ run: { _id: runId } })
      .sort({ updatedAt: -1 })
      .exec();
  }

  /**
   * Get and start one pending task
   * @param runId
   * @param runnerId
   * @param runnerHost
   */
  async findOnePendingTask(runId: string, runnerId: string, runnerHost: string): Promise<StartTaskResponseDto> {
    const run = await this.runModel.findById(runId).exec();
    if (!run) throw new Error(`Run id: ${runId} can't be found.`);

    if (run.endedAt) {
      return { continue: false, run, task: null };
    }

    const startedTask = await this.getPendingTask(runId, runnerId, runnerHost, run.prioritization);

    if (!startedTask) {
      const canCreateNewTask = !(run.closed === false);
      return { continue: canCreateNewTask, run, task: null };
    }

    return { continue: true, run, task: startedTask };
  }

  /**
   * Complete existing task
   * @param taskId
   * @param completeTaskDto
   */
  async complete(taskId: string, completeTaskDto: CompleteTaskDto): Promise<Task> {
    const { cached } = completeTaskDto;
    const task = await this.taskModel.findOne({ _id: taskId }).populate('run').exec();
    if (!task) throw new Error(`Task id: ${taskId} can't be found.`);

    const completedTask = await task.complete(cached).save();
    await this.updateRunStatus(task.run);
    return completedTask;
  }

  async fail(taskId: string): Promise<Task> {
    const task = await this.taskModel.findOne({ _id: taskId }).populate('run').exec();
    if (!task) throw new Error(`Task id: ${taskId} can't be found.`);

    const failedTask = await task.fail().save();
    await this.updateRunStatus(task.run);
    return failedTask;
  }

  async updateRunStatus(run: Run): Promise<void> {
    const allTasks = await this.taskModel.find({ run: { _id: run._id } });
    const endedTasks = allTasks.filter((x) => x.endedAt);
    const failedTasks = allTasks.filter((x) => x.status === TaskStatus.Failed);

    if (run.failFast && failedTasks.length > 0) {
      await run.fail().save();
      return;
    }

    if (run.closed && allTasks.length === endedTasks.length) {
      if (failedTasks.length > 0) {
        await run.fail().save();
      } else {
        await run.complete().save();
      }
    }
  }

  private async getPendingTask(runId: string, runnerId: string, runnerHost: string, prioritization: TaskPriority[]) {
    for (const priority of prioritization) {
      let task;

      switch (priority) {
        case TaskPriority.Longest:
          task = await this.getPendingTaskLongest(runId, runnerId, runnerHost);
          break;
        case TaskPriority.Shortest:
          task = await this.getPendingTaskShortest(runId, runnerId, runnerHost);
          break;
        case TaskPriority.Newest:
          task = await this.getPendingTaskNewest(runId, runnerId, runnerHost);
          break;
        case TaskPriority.Oldest:
          task = await this.getPendingTaskOldest(runId, runnerId, runnerHost);
          break;
        default:
          throw Error('Unknown priority type');
      }

      if (task) {
        return task;
      }
    }

    return undefined;
  }

  private async getPendingTaskLongest(runId: string, runnerId: string, runnerHost: string): Promise<Task> {
    return this.taskModel
      .findOneAndUpdate(
        {
          run: { _id: runId },
          status: TaskStatus.Pending,
          priority: TaskPriority.Longest,
          $or: [{ runnerId: runnerId }, { runnerId: { $exists: false } }],
        },
        { $set: { startedAt: new Date(), status: TaskStatus.Started, runnerId: runnerId, runnerHost: runnerHost } },
        { new: true }
      )
      .sort({ avgDuration: -1 })
      .exec();
  }

  private async getPendingTaskShortest(runId: string, runnerId: string, runnerHost: string): Promise<Task> {
    return this.taskModel
      .findOneAndUpdate(
        {
          run: { _id: runId },
          status: TaskStatus.Pending,
          priority: TaskPriority.Shortest,
          $or: [{ runnerId: runnerId }, { runnerId: { $exists: false } }],
        },
        { $set: { startedAt: new Date(), status: TaskStatus.Started, runnerId: runnerId, runnerHost: runnerHost } },
        { new: true }
      )
      .sort({ avgDuration: 1 })
      .exec();
  }

  // FIFO
  private async getPendingTaskOldest(runId: string, runnerId: string, runnerHost: string): Promise<Task> {
    return this.taskModel
      .findOneAndUpdate(
        {
          run: { _id: runId },
          status: TaskStatus.Pending,
          priority: TaskPriority.Oldest,
          $or: [{ runnerId: runnerId }, { runnerId: { $exists: false } }],
        },
        { $set: { startedAt: new Date(), status: TaskStatus.Started, runnerId: runnerId, runnerHost: runnerHost } },
        { new: true }
      )
      .sort({ createdAt: 1 })
      .exec();
  }

  // LIFO
  private async getPendingTaskNewest(runId: string, runnerId: string, runnerHost: string): Promise<Task> {
    return this.taskModel
      .findOneAndUpdate(
        {
          run: { _id: runId },
          status: TaskStatus.Pending,
          priority: TaskPriority.Newest,
          $or: [{ runnerId: runnerId }, { runnerId: { $exists: false } }],
        },
        { $set: { startedAt: new Date(), status: TaskStatus.Started, runnerId: runnerId, runnerHost: runnerHost } },
        { new: true }
      )
      .sort({ createdAt: -1 })
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

  private async getPreviousRun(run: Run): Promise<Run> {
    return this.runModel.findOne({ pullRequest: run.pullRequest._id }).sort({ endedAt: -1 });
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
