// FIXME: check a way to import this from 'src/infra/database/(migration-commons|table-names).ts'
const defaultStatuses = ['active', 'deleted']

const tableNames = {
  authRefreshToken: 'refresh_token',
}

export const up = async (knex) =>
  knex.schema.createTable(tableNames.authRefreshToken, (table) => {
    table.increments('id', { primaryKey: false })
    table.uuid('uuid', { primaryKey: true }).notNullable().defaultTo(knex.raw('uuid_generate_v4()'))
    table.string('user_email').notNullable()
    table.datetime('expires_at').notNullable()
    table.enum('status', defaultStatuses).defaultTo('active')
    table.timestamps({ useTimestamps: true, defaultToNow: true })
  })

export const down = async (knex) => knex.schema.dropTable(tableNames.authRefreshToken)
