import * as configs from '@/config'
import supertest, { SuperTest, Test } from 'supertest'
import { AuthController } from './AuthController'
import { describe, expect, it, vi } from 'vitest'
import { ExpressHttpServer } from '@/http/ExpressHttpServer'
import { faker } from '@faker-js/faker'
import { GenerateAuthTokenFromRefreshToken } from '@/use-cases/auth/GenerateAuthTokenFromRefreshToken'
import { GenerateResetPassword } from '@/use-cases/password/GenerateResetPassword'
import { KnexAdapter } from '@/database/KnexAdapter'
import { RefreshTokenRepositoryDatabase } from '@/repositories/RefreshTokenRepositoryDatabase'
import { ResetPasswordController } from './ResetPasswordController'
import { ResetPasswordRepositoryDatabase } from '@/repositories/ResetPasswordRepositoryDatabase'
import { SignIn } from '@/use-cases/auth/SignIn'
import { SignUp } from '@/use-cases/auth/SignUp'
import { StatusCodes } from 'http-status-codes'
import { tableNames } from '@/database/table-names.mjs'
import { UpdatePassword } from '@/use-cases/password/UpdatePassword'
import { UserRepositoryDatabase } from '@/repositories/UserRepositoryDatabase'
import { VerifyToken } from '@/use-cases/auth/VerifyToken'

const httpServer = new ExpressHttpServer()
const connection = new KnexAdapter()

const usersRepository = new UserRepositoryDatabase(connection)
const resetPasswordRepository = new ResetPasswordRepositoryDatabase(connection)
const generateResetPassword = new GenerateResetPassword(usersRepository, resetPasswordRepository)
const updatePassword = new UpdatePassword(resetPasswordRepository, usersRepository)
new ResetPasswordController(httpServer, generateResetPassword, updatePassword)

const refreshTokenRepository = new RefreshTokenRepositoryDatabase(connection)
const signUp = new SignUp(usersRepository)
const signIn = new SignIn(usersRepository, refreshTokenRepository)
const verifyToken = new VerifyToken()
const generateAuthTokenFromRefreshToken = new GenerateAuthTokenFromRefreshToken(refreshTokenRepository, usersRepository)
new AuthController(httpServer, signUp, signIn, verifyToken, generateAuthTokenFromRefreshToken)

const request: SuperTest<Test> = supertest(httpServer.server)

describe('POST /api/password/reset', () => {
  const route = '/api/password/reset'

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

  it('returns `201 Created` with only the message property `NODE_ENV=production`', async () => {
    vi.spyOn(configs.config, 'server', 'get').mockReturnValue({ env: 'production', port: 1, host: 'localhost' })
    const email = faker.internet.email()
    const input = { email, password: faker.internet.password() }
    await request.post('/api/auth/sign-up').send(input).expect(StatusCodes.ACCEPTED)
    const { body } = await request.post(route).send({ email }).expect(StatusCodes.CREATED)
    expect(Object.keys(body)).toEqual(['message'])
    expect(body).toEqual(expect.objectContaining({ message: expect.any(String) }))
    // FIXME: find a proper way to restore config from `vi.spyOn`
    vi.spyOn(configs.config, 'server', 'get').mockReturnValue({ env: 'test', port: 1, host: 'localhost' })
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

describe('PUT /api/password', () => {
  const route = '/api/password'

  it('returns `200 OK` when calling when update password with the token, password and confirm password properties', async () => {
    const email = faker.internet.email()
    const authInput = { email, password: faker.internet.password() }
    await request.post('/api/auth/sign-up').send(authInput).expect(StatusCodes.ACCEPTED)
    const userBeforeUpdatePassword = await connection.connection(tableNames.users).where({ email }).first()
    const { body: passwordReset } = await request
      .post('/api/password/reset')
      .send({ email })
      .expect(StatusCodes.CREATED)
    const password = faker.internet.password()
    const input = { token: passwordReset.token, password, confirmPassword: password }
    await request.put(route).send(input).expect(StatusCodes.OK)
    const userAfterUpdatePassword = await connection.connection(tableNames.users).where({ email }).first()
    expect(userAfterUpdatePassword.password).not.toBe(userBeforeUpdatePassword.password)
    expect(userAfterUpdatePassword.salt).not.toBe(userBeforeUpdatePassword.salt)
  })

  it("returns `422 Unprocessable Entity` with the error `password don't match` message", async () => {
    const email = faker.internet.email()
    const authInput = { email, password: faker.internet.password() }
    await request.post('/api/auth/sign-up').send(authInput).expect(StatusCodes.ACCEPTED)
    const { body: passwordReset } = await request
      .post('/api/password/reset')
      .send({ email })
      .expect(StatusCodes.CREATED)
    const input = {
      token: passwordReset.token,
      password: faker.internet.password(),
      confirmPassword: faker.internet.password(),
    }
    const { body } = await request.put(route).send(input).expect(StatusCodes.UNPROCESSABLE_ENTITY)
    expect(body.message).toBe("password don't match")
  })

  it('returns `422 Unprocessable Entity` with the error `invalid password reset token` message', async () => {
    const password = faker.internet.password()
    const input = {
      token: faker.datatype.uuid(),
      password,
      confirmPassword: password,
    }
    const { body } = await request.put(route).send(input).expect(StatusCodes.UNPROCESSABLE_ENTITY)
    expect(body.message).toBe('invalid reset password token')
  })

  it('returns `400 Bad Request` when sending an empty payload', async () => {
    const { body } = await request.put(route).send({}).expect(StatusCodes.BAD_REQUEST)
    expect(body).toEqual([
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'undefined',
        path: ['body', 'token'],
        message: 'token is required',
      },
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'undefined',
        path: ['body', 'password'],
        message: 'password is required',
      },
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'undefined',
        path: ['body', 'confirmPassword'],
        message: 'confirmPassword is required',
      },
    ])
  })
})
