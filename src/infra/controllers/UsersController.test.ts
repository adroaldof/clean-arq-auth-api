import supertest, { SuperTest, Test } from 'supertest'
import { AuthController } from './AuthController'
import { AuthDecorator } from '@/decorators/AuthDecorator'
import { describe, expect, it } from 'vitest'
import { ExpressHttpServer } from '@/http/ExpressHttpServer'
import { faker } from '@faker-js/faker'
import { GenerateAuthTokenFromRefreshToken } from '@/use-cases/auth/GenerateTokenFromRefreshToken'
import { GetMe } from '@/use-cases/users/GetMe'
import { KnexAdapter } from '@/database/KnexAdapter'
import { ListUsers } from '@/use-cases/users/ListUsers'
import { RefreshTokenRepositoryDatabase } from '@/repositories/RefreshTokenRepositoryDatabase'
import { SignIn } from '@/use-cases/auth/SignIn'
import { SignUp } from '@/use-cases/auth/SignUp'
import { StatusCodes } from 'http-status-codes'
import { tableNames } from '@/database/table-names.mjs'
import { UserOutput } from '@/entities/user/User'
import { UserRepositoryDatabase } from '@/repositories/UserRepositoryDatabase'
import { UsersController } from './UsersController'
import { VerifyToken } from '@/use-cases/auth/VerifyToken'

const connection = new KnexAdapter()

const httpServer = new ExpressHttpServer()

const usersRepository = new UserRepositoryDatabase(connection)
const refreshTokenRepository = new RefreshTokenRepositoryDatabase(connection)
const signUp = new SignUp(usersRepository)
const signIn = new SignIn(usersRepository, refreshTokenRepository)
const verifyToken = new VerifyToken()
const generateAuthTokenFromRefreshToken = new GenerateAuthTokenFromRefreshToken(refreshTokenRepository, usersRepository)
new AuthController(httpServer, signUp, signIn, verifyToken, generateAuthTokenFromRefreshToken)

const getMe = new AuthDecorator(new GetMe(usersRepository))
const listUsers = new AuthDecorator(new ListUsers(usersRepository))
new UsersController(httpServer, getMe, listUsers)

const request: SuperTest<Test> = supertest(httpServer.server)

describe('POST /api/users/me', () => {
  it('returns `200 OK` with logged user when authenticated', async () => {
    const input = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      name: faker.name.fullName(),
      profilePictureUrl: faker.image.avatar(),
    }
    await request.post('/api/auth/sign-up').send(input).expect(StatusCodes.ACCEPTED)
    const { body: authenticated } = await request.post('/api/auth/sign-in').send(input).expect(StatusCodes.OK)
    const { body: output } = await request
      .get('/api/users/me')
      .set({ Authorization: `Bearer ${authenticated.accessToken}` })
      .expect(StatusCodes.OK)
    expect(output).toEqual(
      expect.objectContaining({
        email: expect.any(String),
        name: expect.any(String),
        profilePictureUrl: expect.any(String),
      }),
    )
  })

  it('returns `422 Unprocessable Entity` with `invalid token` message when remove part of token', async () => {
    const { body: output } = await request
      .get('/api/users/me')
      .set({ Authorization: `Bearer NOT_A_TOKEN` })
      .expect(StatusCodes.UNPROCESSABLE_ENTITY)
    expect(output.message).toEqual('not authenticated')
  })
})

describe('POST /api/users', () => {
  it('returns `200 OK` with the users list when authenticated', async () => {
    const input = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    }
    const notInDatabase = await connection.connection(tableNames.users).where({ email: input.email }).first()
    expect(notInDatabase).toBeUndefined()
    await request.post('/api/auth/sign-up').send(input).expect(StatusCodes.ACCEPTED)
    const { body: authenticated } = await request.post('/api/auth/sign-in').send(input).expect(StatusCodes.OK)
    const { body: output } = await request
      .get('/api/users')
      .set({ Authorization: `Bearer ${authenticated.accessToken}` })
      .expect(StatusCodes.OK)
    expect(output.filter(({ email }: UserOutput) => email === input.email)).toHaveLength(1)
  })

  it('returns `200 OK` with an empty users list', async () => {
    const input = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    }
    await request.post('/api/auth/sign-up').send(input).expect(StatusCodes.ACCEPTED)
    const { body: authenticated } = await request.post('/api/auth/sign-in').send(input).expect(StatusCodes.OK)
    await connection.connection(tableNames.users).delete()
    const { body: output } = await request
      .get('/api/users')
      .set({ Authorization: `Bearer ${authenticated.accessToken}` })
      .expect(StatusCodes.OK)
    expect(output).toHaveLength(0)
  })

  it('returns `422 Unprocessable Entity` with `invalid token` message when remove part of token', async () => {
    const { body: output } = await request
      .get('/api/users')
      .set({ Authorization: `Bearer NOT_A_TOKEN` })
      .expect(StatusCodes.UNPROCESSABLE_ENTITY)
    expect(output.message).toEqual('not authenticated')
  })
})
