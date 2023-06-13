import { tableNames } from '../table-names.mjs'

export const up = async (knex) =>
  knex.schema.alterTable(tableNames.users, (table) => {
    table.string('name').nullable()
    table.string('profile_picture_url').nullable()
  })

export const down = async (knex) =>
  knex.schema.alterTable(tableNames.users, (table) => {
    table.dropColumn('name')
    table.dropColumn('profile_picture_url')
  })
