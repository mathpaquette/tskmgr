import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PullRequest, PullRequestDocument } from './schemas/pull-request.schema';
import { Model } from 'mongoose';

@Injectable()
export class PullRequestsService {
  constructor(@InjectModel(PullRequest.name) private readonly pullRequestModel: Model<PullRequestDocument>) {}

  public async findAll(): Promise<PullRequest[]> {
    return this.pullRequestModel
      .find() //
      .populate('runs')
      .sort({ updatedAt: -1 })
      .limit(100)
      .exec();
  }
}
