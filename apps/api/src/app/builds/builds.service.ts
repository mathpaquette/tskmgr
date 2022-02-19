import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Build, BuildDocument } from './schemas/build.schema';
import { Model } from 'mongoose';
import { CreateBuildRequestDto, TaskStatus } from '@tskmgr/common';
import { PullRequest, PullRequestDocument } from './schemas/pull-request.schema';
import { Task, TaskDocument } from '../tasks/schemas/task.schema';

@Injectable()
export class BuildsService {
  constructor(
    @InjectModel(PullRequest.name) private readonly pullRequestModel: Model<PullRequestDocument>,
    @InjectModel(Build.name) private readonly buildModel: Model<BuildDocument>,
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>
  ) {}

  async create(createBuildDto: CreateBuildRequestDto): Promise<Build> {
    const pullRequest = await this.pullRequestModel.findOneAndUpdate(
      { name: createBuildDto.pullRequestId },
      {},
      { upsert: true, new: true }
    );

    const build = await this.buildModel.create({
      pullRequest: pullRequest,
      name: createBuildDto.name,
      type: createBuildDto.type,
    });

    pullRequest.builds.push(build._id);
    await pullRequest.save();

    return build;
  }

  async close(id: string): Promise<Build> {
    const build = await this.buildModel.findById(id).exec();
    const hasAllTasksCompleted = await this.hasAllTasksCompleted(build);
    return build.close(hasAllTasksCompleted).save();
  }

  async findAll(): Promise<Build[]> {
    return this.buildModel.find().exec();
  }

  async hasAllTasksCompleted(build: Build): Promise<boolean> {
    const allTasks = await this.taskModel.find({ build: { _id: build._id } });
    const completedTasks = await this.taskModel.find({ build: { _id: build._id }, status: TaskStatus.Completed });
    return allTasks.length === completedTasks.length;
  }
}
