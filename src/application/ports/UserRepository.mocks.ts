import { faker } from '@faker-js/faker'
import { User } from '@/entities/auth/User'
import { UserRepository } from './UserRepository'

export const mockUserRepository = (overrides: Partial<UserRepository> = {}): UserRepository => ({
  save: async () => Promise.resolve(),
  get: async () => User.create(faker.internet.email(), faker.internet.password()),
  list: async () => Promise.resolve([]),
  ...overrides,
})
