import { AppDataSource } from '@tskmgr/db';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

const { type, host, port, username, password, database } = AppDataSource.options as PostgresConnectionOptions;

export interface Environment {
  production: boolean;
  version: string;
  datasource: TypeOrmModuleOptions;
  multer: {
    dest: string;
  };
}

export const environment: Environment = {
  production: false,
  version: 'dev',

  datasource: {
    type,
    host,
    port,
    username,
    password,
    database: `${database}_dev`,
    autoLoadEntities: true,
    synchronize: true,
  },

  multer: {
    dest: './data/api/files',
  },
};
