import { tableNames } from '../table-names.mjs'

export const up = async (knex) =>
  knex.schema.alterTable(tableNames.refreshToken, (table) => {
    table.uuid('user_uuid').notNullable().defaultsTo(knex.raw('uuid_generate_v4()')) // Probably it will have all refresh tokens as deleted so it will not be a problem
    table.dropColumn('user_email')
  })

export const down = async (knex) =>
  knex.schema.alterTable(tableNames.refreshToken, (table) => {
    table.dropColumn('user_uuid')
    table.string('user_email').notNullable().defaultsTo('system.default@email.com') // Probably it will have all refresh tokens as deleted so it will not be a problem
  })
