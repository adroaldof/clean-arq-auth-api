export const up = async (knex: any) => knex.raw('create extension if not exists "uuid-ossp"')

export const down = async (knex: any) => knex.raw('drop extension if exists "uuid-ossp"')
