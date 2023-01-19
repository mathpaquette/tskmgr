import { AppDataSource } from '@tskmgr/db';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { Environment } from './environment';
import { FileEntity } from '../files/file.entity';
import { RunEntity } from '../runs/run.entity';
import { TaskEntity } from '../tasks/task.entity';

const { type, host, port, username, password, database } = AppDataSource.options as PostgresConnectionOptions;

export const environment: Environment = {
  production: true,

  datasource: {
    type,
    host,
    port,
    username,
    password,
    database,
    autoLoadEntities: true,
    synchronize: false,
    entities: [FileEntity, RunEntity, TaskEntity],
  },

  multer: {
    dest: './files',
  },
};
