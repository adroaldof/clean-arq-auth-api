import * as configs from '@/config'
import supertest, { SuperTest, Test } from 'supertest'
import { AuthController } from './AuthController'
import { describe, expect, it, vi } from 'vitest'
import { ExpressHttpServer } from '@/http/ExpressHttpServer'
import { faker } from '@faker-js/faker'
import { GenerateAuthTokenFromRefreshToken } from '@/use-cases/auth/GenerateTokenFromRefreshToken'
import { GenerateResetPassword } from '@/use-cases/password/GenerateResetPassword'
import { KnexAdapter } from '@/database/KnexAdapter'
import { RefreshTokenRepositoryDatabase } from '@/repositories/RefreshTokenRepositoryDatabase'
import { ResetPasswordController } from './ResetPasswordController'
import { ResetPasswordRepositoryDatabase } from '@/repositories/ResetPasswordRepositoryDatabase'
import { SignIn } from '@/use-cases/auth/SignIn'
import { SignUp } from '@/use-cases/auth/SignUp'
import { StatusCodes } from 'http-status-codes'
import { tableNames } from '@/database/table-names.mjs'
import { UserRepositoryDatabase } from '@/repositories/UserRepositoryDatabase'
import { VerifyToken } from '@/use-cases/auth/VerifyToken'

const httpServer = new ExpressHttpServer()
const connection = new KnexAdapter()

const usersRepository = new UserRepositoryDatabase(connection)
const resetPasswordRepository = new ResetPasswordRepositoryDatabase(connection)
const generateResetPassword = new GenerateResetPassword(usersRepository, resetPasswordRepository)
new ResetPasswordController(httpServer, generateResetPassword)

const refreshTokenRepository = new RefreshTokenRepositoryDatabase(connection)
const signUp = new SignUp(usersRepository)
const signIn = new SignIn(usersRepository, refreshTokenRepository)
const verifyToken = new VerifyToken()
const generateAuthTokenFromRefreshToken = new GenerateAuthTokenFromRefreshToken(refreshTokenRepository, usersRepository)
new AuthController(httpServer, signUp, signIn, verifyToken, generateAuthTokenFromRefreshToken)

const request: SuperTest<Test> = supertest(httpServer.server)

const route = '/api/password/reset'

describe('POST /api/auth/sign-up', () => {
  it('returns `201 Created` with the message and token when `NODE_ENV=test`', async () => {
    const email = faker.internet.email()
    const input = { email, password: faker.internet.password() }
    await request.post('/api/auth/sign-up').send(input).expect(StatusCodes.ACCEPTED)
    const { body } = await request.post(route).send({ email }).expect(StatusCodes.CREATED)
    expect(Object.keys(body)).toEqual(['message', 'token'])
    expect(body).toEqual(expect.objectContaining({ message: expect.any(String), token: expect.any(String) }))
    const user = await connection.connection(tableNames.users).where({ email: input.email }).first()
    const resetPassword = await connection.connection(tableNames.resetPassword).where({ userUuid: user.uuid }).first()
    expect(resetPassword.uuid).toBe(body.token)
    expect(resetPassword.userUuid).toBe(user.uuid)
  })

  it('returns `201 Created` with only the message property `NODE_ENV` is not test', async () => {
    vi.spyOn(configs.config, 'server', 'get').mockReturnValue({ env: 'NOT_TEST', port: 1, host: 'localhost' })
    const email = faker.internet.email()
    const input = { email, password: faker.internet.password() }
    await request.post('/api/auth/sign-up').send(input).expect(StatusCodes.ACCEPTED)
    const { body } = await request.post(route).send({ email }).expect(StatusCodes.CREATED)
    expect(Object.keys(body)).toEqual(['message'])
    expect(body).toEqual(expect.objectContaining({ message: expect.any(String) }))
  })

  it('returns `400 Bad Request` when sending an empty input', async () => {
    const input = {}
    const { body } = await request.post(route).send(input).expect(StatusCodes.BAD_REQUEST)
    expect(body).toEqual([
      {
        code: 'invalid_type',
        expected: 'string',
        message: 'email is required',
        path: ['body', 'email'],
        received: 'undefined',
      },
    ])
  })

  it('returns `400 Bad Request` when sending invalid email and password', async () => {
    const input = { email: 'invalid@email' }
    const { body } = await request.post(route).send(input).expect(StatusCodes.BAD_REQUEST)
    expect(body).toEqual([
      {
        validation: 'email',
        code: 'invalid_string',
        message: 'invalid email',
        path: ['body', 'email'],
      },
    ])
  })
})
