import { defaultStatuses } from '../migrations-commons.mjs'
import { tableNames } from '../table-names.mjs'

export const up = async (knex) =>
  knex.schema.createTable(tableNames.refreshToken, (table) => {
    table.increments('id', { primaryKey: false })
    table.uuid('uuid', { primaryKey: true }).notNullable().defaultTo(knex.raw('uuid_generate_v4()'))
    table.string('user_email').notNullable()
    table.datetime('expires_at').notNullable()
    table.enum('status', defaultStatuses).defaultTo('active')
    table.timestamps({ useTimestamps: true, defaultToNow: true })
  })

export const down = async (knex) => knex.schema.dropTable(tableNames.refreshToken)
