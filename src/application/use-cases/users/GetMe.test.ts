import { Auth } from '@/entities/auth/Auth'
import { expect, it } from 'vitest'
import { faker } from '@faker-js/faker'
import { GetMe } from './GetMe'
import { mockAuthRepository } from '@/ports/AuthRepository.mocks'

const email = faker.internet.email()

it('returns the user information with the basic information (only email)', async () => {
  const authRepository = mockAuthRepository()
  const getMe = new GetMe(authRepository)
  const user = await getMe.execute({ email })
  expect(user).toEqual(
    expect.objectContaining({
      email: expect.any(String),
    }),
  )
})

it('returns the user complete information (email, name, profilePictureUrl)', async () => {
  const authRepository = mockAuthRepository({
    get: async () =>
      Promise.resolve(
        Auth.create(faker.internet.email(), faker.internet.password(), faker.name.fullName(), faker.image.imageUrl()),
      ),
  })
  const getMe = new GetMe(authRepository)
  const user = await getMe.execute({ email })
  expect(user).toEqual(
    expect.objectContaining({
      email: expect.any(String),
      name: expect.any(String),
      profilePictureUrl: expect.any(String),
    }),
  )
})
