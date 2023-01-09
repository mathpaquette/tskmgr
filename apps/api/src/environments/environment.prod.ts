import { AppDataSource } from '../config/data-source';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { Environment } from './environment';

const { type, host, port, username, password, database, entities } = AppDataSource.options as PostgresConnectionOptions;

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
    entities,
  },

  multer: {
    dest: './files',
  },
};
