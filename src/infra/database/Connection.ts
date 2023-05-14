import { Knex } from 'knex'

export interface Connection {
  connection: Knex
  migrate(): Promise<void>
  rollback(): Promise<void>
  seed(): Promise<void>
  close(): Promise<void>
}
