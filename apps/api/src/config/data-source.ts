import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { RunEntity } from '../runs/run.entity';
import { TaskEntity } from '../tasks/task.entity';
import { FileRunEntity } from '../files/file-run.entity';
import { FileTaskEntity } from '../files/file-task.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'tskmgr',
  password: process.env.DB_PASSWORD || 'tskmgr',
  database: process.env.DB_DATABASE || 'tskmgr',
  synchronize: false,
  logging: false,
  entities: [FileRunEntity, FileTaskEntity, RunEntity, TaskEntity],
  migrations: ['apps/api/database/migrations/*.js'],
  subscribers: [],
});
