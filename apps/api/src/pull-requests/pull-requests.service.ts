import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PullRequest } from './pull-request.entity';
import { CreatePullRequestDto } from '@tskmgr/common';

@Injectable()
export class PullRequestsService {
  constructor(
    @InjectRepository(PullRequest)
    private readonly pullRequestsRepository: Repository<PullRequest>
  ) {}

  async findAll(): Promise<PullRequest[]> {
    return this.pullRequestsRepository.find();
  }

  async findOneOrCreate(createPullRequest: CreatePullRequestDto): Promise<PullRequest> {
    let pullRequest = await this.pullRequestsRepository.findOneBy({ name: createPullRequest.name });

    if (pullRequest) {
      return pullRequest;
    }

    pullRequest = await this.pullRequestsRepository.create({
      name: createPullRequest.name,
      url: createPullRequest.url,
    });

    return this.pullRequestsRepository.save(pullRequest);
  }
}
