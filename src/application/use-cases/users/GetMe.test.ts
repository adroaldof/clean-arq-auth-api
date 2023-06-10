import { Auth } from '@/entities/auth/Auth'
import { AuthDecorator } from '@/decorators/AuthDecorator'
import { config } from '@/config'
import { expect, it } from 'vitest'
import { faker } from '@faker-js/faker'
import { GetMe } from './GetMe'
import { mockAuthRepository } from '@/ports/AuthRepository.mocks'
import { TokenGenerator } from '@/entities/auth/TokenGenerator'

const userEmail = faker.internet.email()

it('returns the user information with the basic information (only email)', async () => {
  const authRepository = mockAuthRepository()
  const getMe = new GetMe(authRepository)
  const user = await getMe.execute({ userEmail })
  expect(user).toEqual(
    expect.objectContaining({
      email: expect.any(String),
    }),
  )
})

it('returns null when user is not found', async () => {
  const authRepository = mockAuthRepository({ get: async () => Promise.resolve(null) })
  const getMe = new GetMe(authRepository)
  const user = await getMe.execute({ userEmail })
  expect(user).toBeNull()
})

it('returns the user information only when authenticated', async () => {
  const authRepository = mockAuthRepository()
  const getMe = new GetMe(authRepository)
  const authenticatedGetMe = new AuthDecorator(getMe)
  const mockedUser = await Auth.create(userEmail, faker.internet.password())
  const tokenGenerator = new TokenGenerator(config.token.signKey)
  const accessToken = tokenGenerator.generateAuthToken(mockedUser)
  const user = await authenticatedGetMe.execute({ authorization: `Bearer ${accessToken}` })
  expect(user).toEqual(
    expect.objectContaining({
      email: expect.any(String),
    }),
  )
})

it('throws `not authenticated` when no passing a token in the input', async () => {
  const authRepository = mockAuthRepository()
  const getMe = new GetMe(authRepository)
  const authenticatedGetMe = new AuthDecorator(getMe)
  expect(() => authenticatedGetMe.execute({ userEmail })).rejects.toThrow('not authenticated')
})

it('returns the user complete information (email, name, profilePictureUrl)', async () => {
  const authRepository = mockAuthRepository({
    get: async () =>
      Promise.resolve(
        Auth.create(faker.internet.email(), faker.internet.password(), faker.name.fullName(), faker.image.imageUrl()),
      ),
  })
  const getMe = new GetMe(authRepository)
  const user = await getMe.execute({ userEmail })
  expect(user).toEqual(
    expect.objectContaining({
      email: expect.any(String),
      name: expect.any(String),
      profilePictureUrl: expect.any(String),
    }),
  )
})
