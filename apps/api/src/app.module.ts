import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RunEntity } from './runs/run.entity';
import { TaskEntity } from './tasks/task.entity';
import { RunsController } from './runs/runs.controller';
import { RunsService } from './runs/runs.service';
import { TasksService } from './tasks/tasks.service';
import { FileEntity } from './files/file.entity';
import { MulterModule } from '@nestjs/platform-express';
import { PendingTasksService } from './tasks/pending-tasks.service';
import { TasksController } from './tasks/tasks.controller';
import { FilesController } from './files/files.controller';
import { FilesService } from './files/files.service';
import { environment } from './environments/environment';

const ENTITIES = [FileEntity, RunEntity, TaskEntity];

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
  ],
})
export class AppModule {}
