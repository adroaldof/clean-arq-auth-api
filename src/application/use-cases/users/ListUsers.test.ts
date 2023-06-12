import { Auth } from '@/entities/auth/Auth'
import { expect, it } from 'vitest'
import { faker } from '@faker-js/faker'
import { ListUsers } from './ListUsers'
import { mockAuthRepository } from '@/ports/AuthRepository.mocks'

it('returns an empty list when no users are found in database', async () => {
  const authRepository = mockAuthRepository()
  const listUsers = new ListUsers(authRepository)
  const users = await listUsers.execute()
  expect(users).toHaveLength(0)
})

it('returns users from the database', async () => {
  const authRepository = mockAuthRepository({
    list: async () => [
      await Auth.create(faker.internet.email(), faker.internet.password()),
      await Auth.create(faker.internet.email(), faker.internet.password()),
    ],
  })
  const listUsers = new ListUsers(authRepository)
  const users = await listUsers.execute()
  expect(users).toHaveLength(2)
  const [firstUser] = users
  expect(firstUser).not.toHaveProperty('password')
})
