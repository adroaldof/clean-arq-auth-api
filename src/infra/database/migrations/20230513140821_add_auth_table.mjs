const defaultStatuses = ['active', 'deleted']

const tableNames = {
  auth: 'auth',
}

export const up = async (knex) =>
  knex.schema.createTable(tableNames.auth, (table) => {
    table.increments('id', { primaryKey: false })
    table.uuid('uuid', { primaryKey: true }).notNullable().defaultTo(knex.raw('uuid_generate_v4()'))
    table.string('email').notNullable().unique()
    table.string('password').notNullable()
    table.string('salt').notNullable()
    table.enum('status', defaultStatuses).defaultTo('active')
    table.timestamps({ useTimestamps: true, defaultToNow: true })
  })

export const down = async (knex) => knex.schema.dropTable(tableNames.auth)
