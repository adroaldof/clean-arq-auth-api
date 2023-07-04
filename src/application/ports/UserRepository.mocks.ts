import { faker } from '@faker-js/faker'
import { mockUser } from '@/entities/user/User.mocks'
import { Password } from '@/entities/auth/Password'
import { User } from '@/entities/user/User'
import { UserRepository } from './UserRepository'

export const mockUserRepository = (overrides: Partial<UserRepository> = {}): UserRepository => ({
  save: async () => Promise.resolve(),
  getByEmail: async () => Promise.resolve(mockUser()),
  getByUuid: async () => Promise.resolve(mockUser()),
  list: async () => Promise.resolve([]),
  updatePassword: async (uuid: string, password: Password) => Promise.resolve(),
  update: async (user: User) => Promise.resolve(),
  ...overrides,
})
