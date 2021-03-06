import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './tasks/schemas/task.schema';
import { TasksController } from './tasks/tasks.controller';
import { TasksService } from './tasks/tasks.service';
import { PullRequest, PullRequestSchema } from './pull-requests/schemas/pull-request.schema';
import { Run, RunSchema } from './runs/schemas/run.schema';
import { RunsController } from './runs/runs.controller';
import { RunsService } from './runs/runs.service';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { environment } from '../environments/environment';
import { PullRequestsService } from './pull-requests/pull-requests.service';
import { PullRequestsController } from './pull-requests/pull-requests.controller';

@Module({
  imports: [
    MongooseModule.forRoot(environment.mongodbUri, { autoIndex: true }),
    MongooseModule.forFeature([{ name: Run.name, schema: RunSchema }]),
    MongooseModule.forFeature([{ name: PullRequest.name, schema: PullRequestSchema }]),
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
  ],
  controllers: [RunsController, TasksController, PullRequestsController],
  providers: [
    RunsService,
    TasksService,
    PullRequestsService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
