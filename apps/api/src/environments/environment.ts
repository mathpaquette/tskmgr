import { AppDataSource } from '@tskmgr/db';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { version } from '../../../../package.json';

const { type } = AppDataSource.options as PostgresConnectionOptions;

export interface Environment {
  production: boolean;
  version: string;
  datasource: TypeOrmModuleOptions & PostgresConnectionOptions;
  multer: {
    dest: string;
  };
}

export const environment: Environment = {
  production: false,
  version: `${version}-dev`,
  datasource: {
    type,
    host: 'localhost',
    port: 5432,
    username: 'tskmgr',
    password: 'tskmgr',
    database: `tskmgr_dev`,
    schema: 'public',
    autoLoadEntities: true,
    synchronize: true,
    logging: false,
  },
  multer: {
    dest: './files',
  },
};
