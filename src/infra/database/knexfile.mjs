import path from 'path'
import { snake, toCamel } from 'snake-camel'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default {
  client: process.env.DATABASE_CLIENT || 'pg',
  connection: {
    host: process.env.POSTGRES_HOST || '0.0.0.0',
    port: +(process.env.POSTGRES_PORT || 5432),
    database: process.env.POSTGRES_DB || 'postgres',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
  },
  migrations: {
    extension: 'mjs',
    loadExtensions: ['.mjs'],
    stub: path.join(__dirname, './stubs/migration.stub'),
    directory: path.join(__dirname, './migrations'),
  },
  seeds: {
    extension: 'mjs',
    loadExtensions: ['.mjs'],
    stub: path.join(__dirname, './stubs/seed.stub'),
    directory: path.join(__dirname, './seeds'),
  },
  postProcessResponse: (result) => (Array.isArray(result) ? result.map(toCamel) : toCamel(result)),
  wrapIdentifier: (value, origImpl) => origImpl(snake(value)),
}
