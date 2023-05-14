export const config = {
  server: {
    env: process.env.NODE_ENV || 'development',
    port: +(process.env.SERVER_PORT || 5000),
    host: process.env.SERVER_HOST || 'localhost',
  },
  database: {
    client: process.env.DATABASE_CLIENT || 'pg',
    host: process.env.POSTGRES_HOST || '0.0.0.0',
    port: +(process.env.POSTGRES_PORT || 5432),
    database: process.env.POSTGRES_DB || 'postgres',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
  },
}
