import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { FileEntity } from '../files/file.entity';
import { RunEntity } from '../runs/run.entity';
import { TaskEntity } from '../tasks/task.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.API_DB_HOST || 'localhost',
  port: Number(process.env.API_DB_PORT) || 5432,
  username: process.env.API_DB_USERNAME || 'tskmgr',
  password: process.env.API_DB_PASSWORD || 'tskmgr',
  database: process.env.API_DB_DATABASE || 'tskmgr',
  synchronize: false,
  logging: false,
  entities: [FileEntity, RunEntity, TaskEntity],
  migrations: [],
  subscribers: [],
});
