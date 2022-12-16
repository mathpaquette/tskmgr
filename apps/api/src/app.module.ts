import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RunEntity } from './runs/run.entity';
import { TaskEntity } from './tasks/task.entity';
import { RunsController } from './runs/runs.controller';
import { RunsService } from './runs/runs.service';
import { TasksService } from './tasks/tasks.service';
import { FileEntity } from './files/file.entity';
import { MulterModule } from '@nestjs/platform-express';
import { RunnerEntity } from './runners/runner.entity';

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
    TypeOrmModule.forFeature([
      RunEntity, //
      RunnerEntity,
      TaskEntity,
      FileEntity,
    ]),
    MulterModule.register({
      dest: './files', // TODO: configure
    }),
  ],
  controllers: [
    RunsController, //
  ],
  providers: [
    RunsService, //
    TasksService,
  ],
})
export class AppModule {}
