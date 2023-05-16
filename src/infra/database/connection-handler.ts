import knexJs from 'knex'
import { knexConfig } from './knexConfig'

export const knex = knexJs(knexConfig)
