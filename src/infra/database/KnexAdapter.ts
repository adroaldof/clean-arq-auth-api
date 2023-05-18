import knex, { Knex } from 'knex'
import knexConfig from './knexfile.mjs'
import { Connection } from './Connection'

/* c8 ignore start */
export class KnexAdapter implements Connection {
  connection: Knex

  constructor() {
    this.connection = knex(knexConfig)
  }

  async migrate(): Promise<void> {
    await this.connection.migrate.latest()
  }

  async rollback(): Promise<void> {
    await this.connection.migrate.rollback()
  }

  async seed(): Promise<void> {
    await this.connection.seed.run()
  }

  async close(): Promise<void> {
    await this.connection.destroy()
  }
}
/* c8 ignore stop */
