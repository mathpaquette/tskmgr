import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RunEntity } from './runs/run.entity';
import { TaskEntity } from './tasks/task.entity';
import { RunsController } from './runs/runs.controller';
import { RunsService } from './runs/runs.service';
import { TasksService } from './tasks/tasks.service';
import { MulterModule } from '@nestjs/platform-express';
import { PendingTasksService } from './tasks/pending-tasks.service';
import { TasksController } from './tasks/tasks.controller';
import { FilesController } from './files/files.controller';
import { FilesService } from './files/files.service';
import { environment } from './environments/environment';
import { FileRunEntity } from './files/file-run.entity';
import { FileTaskEntity } from './files/file-task.entity';
import { AllExceptionsFilter } from './config/all-exceptions.filter';
import { APP_FILTER } from '@nestjs/core';

const ENTITIES = [FileRunEntity, FileTaskEntity, RunEntity, TaskEntity];

@Module({
  imports: [
    TypeOrmModule.forRoot(environment.datasource),
    TypeOrmModule.forFeature(ENTITIES),
    MulterModule.register({ ...environment.multer }),
  ],
  controllers: [
    RunsController, //
    TasksController,
    FilesController,
  ],
  providers: [
    RunsService, //
    TasksService,
    FilesService,
    PendingTasksService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
