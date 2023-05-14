import { Knex } from 'knex';

export const up = async (knex: Knex): Promise<Knex.SchemaBuilder> =>
  knex.raw('create extension if not exists "uuid-ossp"')

export const down = async (knex: Knex): Promise<Knex.SchemaBuilder> => knex.raw('drop extension if exists "uuid-ossp"')
