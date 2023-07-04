import { expect, it } from 'vitest'
import { faker } from '@faker-js/faker'
import { mockUser } from '@/entities/user/User.mocks'
import { mockUserRepository } from '@/ports/UserRepository.mocks'
import { User } from '@/entities/user/User'
import { UserDetail } from './UserDetail'

const userUuid = faker.datatype.uuid()

it('returns null when user is not found', async () => {
  const usersRepository = mockUserRepository({ getByUuid: async () => Promise.resolve(null) })
  const getMe = new UserDetail(usersRepository)
  const user = await getMe.execute({ userUuid })
  expect(user).toBeNull()
})

it('returns the user complete information (email, name, profilePictureUrl)', async () => {
  const usersRepository = mockUserRepository({
    getByUuid: async () => Promise.resolve(mockUser()),
  })
  const getMe = new UserDetail(usersRepository)
  const user = await getMe.execute({ userUuid })
  expect(user).toEqual(
    expect.objectContaining({
      email: expect.any(String),
      name: expect.any(String),
      profilePictureUrl: expect.any(String),
    }),
  )
})
