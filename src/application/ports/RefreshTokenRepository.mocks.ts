import { faker } from '@faker-js/faker'
import { RefreshTokenRepository } from './RefreshTokenRepository'

export const mockRefreshTokenRepository = (
  overrides: Partial<RefreshTokenRepository> = {},
): RefreshTokenRepository => ({
  save: async () => Promise.resolve(faker.datatype.uuid()),
  getByUuid: async () => Promise.resolve(null),
  invalidateByUserUuid: async () => Promise.resolve(),
  ...overrides,
})
