import { expect, it } from 'vitest'
import { ListUsers } from './ListUsers'
import { mockUser } from '@/entities/user/User.mocks'
import { mockUserRepository } from '@/ports/UserRepository.mocks'

it('returns an empty list when no users are found in database', async () => {
  const usersRepository = mockUserRepository()
  const listUsers = new ListUsers(usersRepository)
  const users = await listUsers.execute()
  expect(users).toHaveLength(0)
})

it('returns users from the database', async () => {
  const usersRepository = mockUserRepository({
    list: async () => [await mockUser(), await mockUser()],
  })
  const listUsers = new ListUsers(usersRepository)
  const users = await listUsers.execute()
  expect(users).toHaveLength(2)
  const [firstUser] = users
  expect(firstUser).not.toHaveProperty('password')
})
