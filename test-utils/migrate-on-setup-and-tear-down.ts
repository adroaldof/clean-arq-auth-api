import { KnexAdapter } from '@/database/KnexAdapter'

const connection = new KnexAdapter()

export const setup = async () => {
  await connection.migrate()
}

export const teardown = async () => {
  await connection.rollback()
}
