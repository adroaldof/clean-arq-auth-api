import { defaultStatuses } from '../migrations-commons.mjs';
import { Knex } from 'knex';
import { tableNames } from '../table-names.mjs';

export const up = async (knex: Knex): Promise<Knex.SchemaBuilder> =>
  knex.schema.createTable(tableNames.auth, (table: Knex.CreateTableBuilder) => {
    table.increments('id', { primaryKey: false })
    table.uuid('uuid', { primaryKey: true }).notNullable().defaultTo(knex.raw('uuid_generate_v4()'))
    table.string('email').notNullable().unique()
    table.string('password').notNullable()
    table.string('salt').notNullable()
    table.enum('status', defaultStatuses).defaultTo('active')
    table.timestamps({ useTimestamps: true, defaultToNow: true })
  })

export const down = async (knex: Knex): Promise<Knex.SchemaBuilder> => knex.schema.dropTable(tableNames.auth)
