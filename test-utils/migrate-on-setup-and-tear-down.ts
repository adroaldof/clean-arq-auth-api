import { KnexAdapter } from '@/database/KnexAdapter'

const connection = new KnexAdapter()

export const setup = async () => {
  if (process.env.NODE_ENV === 'unit') return
  await connection.migrate()
}

export const teardown = async () => {
  if (process.env.NODE_ENV === 'unit') return
  await connection.rollback()
}
