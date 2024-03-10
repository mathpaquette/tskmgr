import 'reflect-metadata';
import { DataSource, LoggerOptions } from 'typeorm';
import { join } from 'path';
import { readFileSync } from 'fs';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'tskmgr',
  password: process.env.DB_PASSWORD || 'tskmgr',
  database: process.env.DB_DATABASE || 'tskmgr',
  schema: process.env.DB_SCHEMA,
  synchronize: false,
  logging: (process.env.DB_LOGGING as LoggerOptions) || false,
  extra: {
    ssl: getSSLConfig(),
  },
  entities: ['apps/api/src/**/*.entity.ts'],
  migrations: [join(__dirname, '..', 'migrations', '*.js')],
  subscribers: [],
});

function getSSLConfig(): boolean | { rejectUnauthorized: boolean; ca: string; key: string; cert: string } {
  const caPath = process.env.DB_CA_PATH;
  const keyPath = process.env.DB_KEY_PATH;
  const certPath = process.env.DB_CERT_PATH;

  if (!caPath || !keyPath || !certPath) {
    return false;
  }

  return {
    rejectUnauthorized: false,
    ca: readFileSync(caPath).toString(),
    key: readFileSync(keyPath).toString(),
    cert: readFileSync(certPath).toString(),
  };
}
