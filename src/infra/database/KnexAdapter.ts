import knex, { Knex } from 'knex'

import { Connection } from './Connection'
import * as knexConfig from './knexfile'

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
