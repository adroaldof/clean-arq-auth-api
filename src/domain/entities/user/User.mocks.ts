import { faker } from '@faker-js/faker'
import { User } from './User'

export const mockUser = async (overrides: Partial<UserInput> = {}): Promise<User> =>
  User.create(
    String(overrides.email || faker.internet.email()),
    String(overrides.password || faker.internet.password()),
    overrides.name || faker.name.fullName(),
    overrides.profilePictureUrl || faker.image.imageUrl(),
  )

type UserInput = {
  email: string
  password: string
  name?: string
  profilePictureUrl?: string
}
