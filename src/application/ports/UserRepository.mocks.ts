import { faker } from '@faker-js/faker'
import { Password } from '@/entities/auth/Password'
import { User } from '@/entities/user/User'
import { UserRepository } from './UserRepository'

export const mockUserRepository = (overrides: Partial<UserRepository> = {}): UserRepository => ({
  save: async () => Promise.resolve(),
  get: async () => User.create(faker.internet.email(), faker.internet.password()),
  list: async () => Promise.resolve([]),
  updatePassword: async (password: Password) => Promise.resolve(),
  ...overrides,
})
