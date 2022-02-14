import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './tasks/schemas/task.schema';
import { TasksController } from './tasks/tasks.controller';
import { TasksService } from './tasks/tasks.service';
import { PullRequest, PullRequestSchema } from './builds/schemas/pull-request.schema';
import { Build, BuildSchema } from './builds/schemas/build.schema';
import { BuildsController } from './builds/builds.controller';
import { BuildsService } from './builds/builds.service';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { environment } from '../environments/environment';

@Module({
  imports: [
    MongooseModule.forRoot(environment.mongodb, { autoIndex: true }),
    MongooseModule.forFeature([{ name: Build.name, schema: BuildSchema }]),
    MongooseModule.forFeature([{ name: PullRequest.name, schema: PullRequestSchema }]),
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
  ],
  controllers: [BuildsController, TasksController],
  providers: [
    BuildsService,
    TasksService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
