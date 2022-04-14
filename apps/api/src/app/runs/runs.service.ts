import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Run, RunDocument } from './schemas/run.schema';
import { Model } from 'mongoose';
import { CreateRunRequestDto, TaskStatus, SetLeaderRequestDto, SetLeaderResponseDto } from '@tskmgr/common';
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
    const pullRequest = await this.pullRequestModel.findOneAndUpdate(
      { name: createRunDto.pullRequestName },
      { url: createRunDto.pullRequestUrl },
      { upsert: true, new: true }
    );

    const run = await this.runModel.create({
      pullRequest: pullRequest,
      name: createRunDto.name,
      url: createRunDto.url,
      type: createRunDto.type,
      runners: createRunDto.runners,
      prioritization: createRunDto.prioritization,
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

  async abort(id: string): Promise<Run> {
    const run = await this.runModel.findById(id).exec();
    return run.abort().save();
  }

  async fail(id: string): Promise<Run> {
    const run = await this.runModel.findById(id).exec();
    return run.fail().save();
  }

  async setLeader(id: string, setLeaderRequestDto: SetLeaderRequestDto): Promise<SetLeaderResponseDto> {
    const { runnerId } = setLeaderRequestDto;
    const run = await this.runModel.findOneAndUpdate(
      {
        _id: id,
        $or: [{ leaderId: { $exists: false } }, { leaderId: runnerId }],
      },
      { $set: { leaderId: runnerId } },
      { new: true }
    );

    return { isLeader: !!run, run: run };
  }

  async findById(id: string): Promise<Run> {
    return this.runModel.findById(id).exec();
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
