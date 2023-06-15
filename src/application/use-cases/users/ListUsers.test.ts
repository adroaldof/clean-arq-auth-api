import { expect, it } from 'vitest';
import { faker } from '@faker-js/faker';
import { ListUsers } from './ListUsers';
import { mockUserRepository } from '@/ports/UserRepository.mocks';
import { User } from '@/entities/user/User';

it('returns an empty list when no users are found in database', async () => {
  const usersRepository = mockUserRepository()
  const listUsers = new ListUsers(usersRepository)
  const users = await listUsers.execute()
  expect(users).toHaveLength(0)
})

it('returns users from the database', async () => {
  const usersRepository = mockUserRepository({
    list: async () => [
      await User.create(faker.internet.email(), faker.internet.password()),
      await User.create(faker.internet.email(), faker.internet.password()),
    ],
  })
  const listUsers = new ListUsers(usersRepository)
  const users = await listUsers.execute()
  expect(users).toHaveLength(2)
  const [firstUser] = users
  expect(firstUser).not.toHaveProperty('password')
})
