import supertest, { SuperTest, Test } from 'supertest'
import { AuthController } from './AuthController'
import { AuthDecorator } from '@/decorators/AuthDecorator'
import { AuthRepositoryDatabase } from '@/repositories/AuthRepositoryDatabase'
import { describe, expect, it } from 'vitest'
import { ExpressHttpServer } from '@/http/ExpressHttpServer'
import { faker } from '@faker-js/faker'
import { GenerateAuthTokenFromRefreshToken } from '@/use-cases/auth/GenerateTokenFromRefreshToken'
import { GetMe } from '@/use-cases/users/GetMe'
import { KnexAdapter } from '@/database/KnexAdapter'
import { RefreshTokenRepositoryDatabase } from '@/repositories/RefreshTokenRepositoryDatabase'
import { SignIn } from '@/use-cases/auth/SignIn'
import { SignUp } from '@/use-cases/auth/SignUp'
import { StatusCodes } from 'http-status-codes'
import { UsersController } from './UsersController'
import { VerifyToken } from '@/use-cases/auth/VerifyToken'

const connection = new KnexAdapter()

const httpServer = new ExpressHttpServer()

const authRepository = new AuthRepositoryDatabase(connection)
const refreshTokenRepository = new RefreshTokenRepositoryDatabase(connection)
const signUp = new SignUp(authRepository)
const signIn = new SignIn(authRepository, refreshTokenRepository)
const verifyToken = new VerifyToken()
const generateAuthTokenFromRefreshToken = new GenerateAuthTokenFromRefreshToken(refreshTokenRepository, authRepository)
new AuthController(httpServer, signUp, signIn, verifyToken, generateAuthTokenFromRefreshToken)

const getMe = new AuthDecorator(new GetMe(authRepository))
new UsersController(httpServer, getMe)

const request: SuperTest<Test> = supertest(httpServer.server)

describe('POST /api/users/me', () => {
  it('returns `200 OK` when user is authenticated', async () => {
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
    const input = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    }
    await request.post('/api/auth/sign-up').send(input).expect(StatusCodes.ACCEPTED)
    const { body: authenticated } = await request.post('/api/auth/sign-in').send(input).expect(StatusCodes.OK)
    const { body: output } = await request
      .get('/api/users/me')
      .set({ Authorization: `Bearer ${String(authenticated.accessToken).slice(5)}` })
      .expect(StatusCodes.UNPROCESSABLE_ENTITY)
    expect(output.message).toEqual('not authenticated')
  })
})
