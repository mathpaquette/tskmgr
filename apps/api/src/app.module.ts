import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PullRequest } from './pull-requests/pull-request.entity';
import { Run } from './runs/run.entity';
import { Task } from './tasks/task.entity';
import { PullRequestsController } from './pull-requests/pull-requests.controller';
import { RunsController } from './runs/runs.controller';
import { PullRequestsService } from './pull-requests/pull-requests.service';
import { RunsService } from './runs/runs.service';
import { TasksService } from './tasks/tasks.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'tskmgr',
      password: 'tskmgr',
      database: 'tskmgr_dev',
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([PullRequest]),
    TypeOrmModule.forFeature([Run]),
    TypeOrmModule.forFeature([Task]),
  ],
  controllers: [PullRequestsController, RunsController],
  providers: [PullRequestsService, RunsService, TasksService],
})
export class AppModule {}
