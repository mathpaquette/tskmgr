import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { join } from 'path';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'tskmgr',
  password: process.env.DB_PASSWORD || 'tskmgr',
  database: process.env.DB_DATABASE || 'tskmgr',
  synchronize: false,
  logging: false,
  entities: ['apps/api/src/**/*.entity.ts'],
  migrations: [`${join(__dirname, '../migrations')}/*.js`],
  subscribers: [],
});
