import { Auth } from '@/entities/auth/Auth'
import { AuthRepository } from './AuthRepository'
import { faker } from '@faker-js/faker'

export const mockAuthRepository = (overrides: Partial<AuthRepository> = {}): AuthRepository => ({
  save: async () => Promise.resolve(),
  get: async () => Auth.create(faker.internet.email(), faker.internet.password()),
  list: async () => Promise.resolve([]),
  ...overrides,
})
