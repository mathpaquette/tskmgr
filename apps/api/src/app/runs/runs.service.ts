import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Run, RunDocument } from './schemas/run.schema';
import { Model } from 'mongoose';
import { CreateRunRequestDto, TaskStatus } from '@tskmgr/common';
import { PullRequest, PullRequestDocument } from '../pull-requests/schemas/pull-request.schema';
import { Task, TaskDocument } from '../tasks/schemas/task.schema';

@Injectable()
export class RunsService {
  constructor(
    @InjectModel(PullRequest.name) private readonly pullRequestModel: Model<PullRequestDocument>,
    @InjectModel(Run.name) private readonly runModel: Model<RunDocument>,
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>
  ) {}

  async create(createRunDto: CreateRunRequestDto): Promise<Run> {
    const pullRequest = await this.pullRequestModel.findOneAndUpdate({ name: createRunDto.pullRequestId }, {}, { upsert: true, new: true });

    const run = await this.runModel.create({
      pullRequest: pullRequest,
      name: createRunDto.name,
      type: createRunDto.type,
    });

    pullRequest.runs.push(run._id);
    await pullRequest.save();

    return run;
  }

  async close(id: string): Promise<Run> {
    const run = await this.runModel.findById(id).exec();
    const hasAllTasksCompleted = await this.hasAllTasksCompleted(run);
    return run.close(hasAllTasksCompleted).save();
  }

  async findAll(): Promise<Run[]> {
    return this.runModel
      .find() //
      .sort({ updatedAt: -1 })
      .limit(100)
      .exec();
  }

  async hasAllTasksCompleted(run: Run): Promise<boolean> {
    const allTasks = await this.taskModel.find({ run: { _id: run._id } });
    const completedTasks = await this.taskModel.find({ run: { _id: run._id }, status: TaskStatus.Completed });
    return allTasks.length === completedTasks.length;
  }
}
