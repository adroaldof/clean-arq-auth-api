import path from 'path';
import { config } from '@/config';
import { Knex } from 'knex';
import { snake, toCamel } from 'snake-camel';

export const knexConfig = {
  client: config.database.client,
  /* istanbul ignore next */
  connection: {
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user,
    password: config.database.password,
  },
  migrations: {
    extension: 'ts',
    stub: path.join(__dirname, './stubs/migration.stub'),
    directory: path.join(__dirname, './migrations'),
  },
  seeds: {
    extension: 'ts',
    stub: path.join(__dirname, './stubs/seed.stub'),
    directory: path.join(__dirname, './seeds'),
  },
  postProcessResponse: (result) => (Array.isArray(result) ? result.map(toCamel) : toCamel(result)),
  wrapIdentifier: (value, origImpl) => origImpl(snake(value)),
} as Knex.Config
