import { Controller, Get } from '@nestjs/common';
import { PullRequestsService } from './pull-requests.service';
import { PullRequest } from './schemas/pull-request.schema';

@Controller('pull-requests')
export class PullRequestsController {
  constructor(private readonly pullRequestsService: PullRequestsService) {}

  @Get()
  findAll(): Promise<PullRequest[]> {
    return this.pullRequestsService.findAll();
  }
}
