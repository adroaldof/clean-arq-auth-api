import { AuthDecorator } from '@/decorators/AuthDecorator'
import { config } from '@/config'
import { expect, it } from 'vitest'
import { faker } from '@faker-js/faker'
import { GetMe } from './GetMe'
import { JwtTokenGenerator } from '@/entities/token/JwtTokenGenerator'
import { mockUser } from '@/entities/user/User.mocks'
import { mockUserRepository } from '@/ports/UserRepository.mocks'

const authenticatedUserUuid = faker.datatype.uuid()

it('returns the user information with the basic information (only email)', async () => {
  const usersRepository = mockUserRepository()
  const getMe = new GetMe(usersRepository)
  const user = await getMe.execute({ authenticatedUserUuid })
  expect(user).toEqual(
    expect.objectContaining({
      email: expect.any(String),
    }),
  )
})

it('returns null when user is not found', async () => {
  const usersRepository = mockUserRepository({ getByUuid: async () => Promise.resolve(null) })
  const getMe = new GetMe(usersRepository)
  const user = await getMe.execute({ authenticatedUserUuid })
  expect(user).toBeNull()
})

it('returns the user information only when authenticated', async () => {
  const usersRepository = mockUserRepository()
  const getMe = new GetMe(usersRepository)
  const authenticatedGetMe = new AuthDecorator(getMe)
  const mockedUser = await mockUser()
  const tokenGenerator = new JwtTokenGenerator({ secretOrPrivateKey: config.token.signKey })
  const accessToken = tokenGenerator.generateAuthToken(mockedUser)
  const user = await authenticatedGetMe.execute({ authorization: `Bearer ${accessToken}` })
  expect(user).toEqual(
    expect.objectContaining({
      email: expect.any(String),
    }),
  )
})

it('throws `not authenticated` when no passing a token in the input', async () => {
  const usersRepository = mockUserRepository()
  const getMe = new GetMe(usersRepository)
  const authenticatedGetMe = new AuthDecorator(getMe)
  expect(() => authenticatedGetMe.execute({ authenticatedUserUuid })).rejects.toThrow('not authenticated')
})

it('returns the user complete information (email, name, profilePictureUrl)', async () => {
  const usersRepository = mockUserRepository({
    getByUuid: async () => Promise.resolve(mockUser()),
  })
  const getMe = new GetMe(usersRepository)
  const user = await getMe.execute({ authenticatedUserUuid })
  expect(user).toEqual(
    expect.objectContaining({
      email: expect.any(String),
      name: expect.any(String),
      profilePictureUrl: expect.any(String),
    }),
  )
})
