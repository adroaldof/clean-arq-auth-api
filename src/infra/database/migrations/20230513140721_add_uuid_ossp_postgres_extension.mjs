export const up = async (knex) => knex.raw('create extension if not exists "uuid-ossp"')

export const down = async (knex) => knex.raw('drop extension if exists "uuid-ossp"')
