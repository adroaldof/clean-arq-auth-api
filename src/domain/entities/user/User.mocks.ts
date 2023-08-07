import { faker } from '@faker-js/faker'
import { User } from './User'

export const mockUserInput = (overrides: Partial<UserInput> = {}): UserInput => ({
  email: faker.internet.email(),
  password: faker.internet.password(),
  name: faker.name.fullName(),
  profilePictureUrl: faker.image.imageUrl(),
  uuid: faker.datatype.uuid(),
  ...overrides,
})

export const mockUser = async (overrides: Partial<UserInput> = {}): Promise<User> =>
  User.create(mockUserInput(overrides))

type UserInput = {
  email: string
  password: string
  name?: string
  profilePictureUrl?: string
  uuid?: string
}
