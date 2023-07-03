import { AuthDecorator } from '@/decorators/AuthDecorator'
import { config } from '@/config'
import { expect, it } from 'vitest'
import { faker } from '@faker-js/faker'
import { GetMe } from './GetMe'
import { JwtTokenGenerator } from '@/entities/token/JwtTokenGenerator'
import { mockUserRepository } from '@/ports/UserRepository.mocks'
import { User } from '@/entities/user/User'

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
  const mockedUser = await User.create(faker.internet.email(), faker.internet.password())
  const tokenGenerator = new JwtTokenGenerator(config.token.signKey)
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
    getByUuid: async () =>
      Promise.resolve(
        User.create(faker.internet.email(), faker.internet.password(), faker.name.fullName(), faker.image.imageUrl()),
      ),
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
