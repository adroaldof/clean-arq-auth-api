import supertest, { SuperTest, Test } from 'supertest'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AuthController } from './AuthController'
import { AuthRepositoryDatabase } from '@/repositories/AuthRepositoryDatabase'
import { ExpressHttpServer } from '@/http/ExpressHttpServer'
import { faker } from '@faker-js/faker'
import { GenerateAuthTokenFromRefreshToken } from '@/use-cases/auth/GenerateTokenFromRefreshToken'
import { KnexAdapter } from '@/database/KnexAdapter'
import { RefreshTokenRepositoryDatabase } from '@/repositories/RefreshTokenRepositoryDatabase'
import { SignIn } from '@/use-cases/auth/SignIn'
import { SignUp } from '@/use-cases/auth/SignUp'
import { StatusCodes } from 'http-status-codes'
import { tableNames } from '@/database/table-names.mjs'
import { VerifyToken } from '@/use-cases/auth/VerifyToken'

const httpServer = new ExpressHttpServer()
const connection = new KnexAdapter()

const authRepository = new AuthRepositoryDatabase(connection)
const refreshTokenRepository = new RefreshTokenRepositoryDatabase(connection)
const signUp = new SignUp(authRepository)
const signIn = new SignIn(authRepository, refreshTokenRepository)
const verifyToken = new VerifyToken()
const generateAuthTokenFromRefreshToken = new GenerateAuthTokenFromRefreshToken(refreshTokenRepository, authRepository)
new AuthController(httpServer, signUp, signIn, verifyToken, generateAuthTokenFromRefreshToken)

const request: SuperTest<Test> = supertest(httpServer.server)

beforeEach(async () => {
  await connection.migrate()
})

afterEach(async () => {
  await connection.rollback()
})

describe('POST /api/auth/sign-up', () => {
  it('returns `202 Accepted` when creating an auth user with valid email and password', async () => {
    const input = { email: faker.internet.email(), password: faker.internet.password() }
    const { body } = await request.post('/api/auth/sign-up').send(input).expect(StatusCodes.ACCEPTED)
    expect(Object.keys(body)).toHaveLength(0)
    const createdAuthUser = await connection.connection(tableNames.auth).where({ email: input.email }).first()
    expect(createdAuthUser.email).toEqual(input.email)
  })

  it('returns `202 Accepted` when user already exists (security reasons)', async () => {
    const input = { email: faker.internet.email(), password: faker.internet.password() }
    await request.post('/api/auth/sign-up').send(input).expect(StatusCodes.ACCEPTED)
    await request.post('/api/auth/sign-up').send(input).expect(StatusCodes.ACCEPTED)
  })

  it('returns `400 Bad Request` when sending an empty input', async () => {
    const input = {}
    const { body } = await request.post('/api/auth/sign-up').send(input).expect(StatusCodes.BAD_REQUEST)
    expect(body).toEqual([
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'undefined',
        path: ['body', 'email'],
        message: 'email is required',
      },
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'undefined',
        path: ['body', 'password'],
        message: 'password is required',
      },
    ])
  })

  it('returns `400 Bad Request` when sending invalid email and password', async () => {
    const input = { email: 'invalid@email', password: '123' }
    const { body } = await request.post('/api/auth/sign-up').send(input).expect(StatusCodes.BAD_REQUEST)
    expect(body).toEqual([
      {
        validation: 'email',
        code: 'invalid_string',
        message: 'invalid email',
        path: ['body', 'email'],
      },
      {
        code: 'too_small',
        minimum: 8,
        type: 'string',
        inclusive: true,
        exact: false,
        message: 'password must be at least 8 characters long',
        path: ['body', 'password'],
      },
    ])
  })
})

describe('POST /api/auth/sign-in', () => {
  it('returns the access token when the user and password are valid', async () => {
    const input = { email: faker.internet.email(), password: faker.internet.password() }
    await request.post('/api/auth/sign-up').send(input).expect(StatusCodes.ACCEPTED)
    const { body: output } = await request.post('/api/auth/sign-in').send(input).expect(StatusCodes.OK)
    expect(output).toEqual(
      expect.objectContaining({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      }),
    )
  })

  it('returns `400 Bad Request` error when sending an empty input', async () => {
    const { body: output } = await request.post('/api/auth/sign-in').send({}).expect(StatusCodes.BAD_REQUEST)
    expect(output).toEqual([
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'undefined',
        path: ['body', 'email'],
        message: 'email is required',
      },
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'undefined',
        path: ['body', 'password'],
        message: 'password is required',
      },
    ])
  })

  it('returns `400 Bad Request` error when sending a invalid email', async () => {
    const input = { email: 'invalid@email', password: faker.internet.password() }
    const { body: output } = await request.post('/api/auth/sign-in').send(input).expect(StatusCodes.BAD_REQUEST)
    expect(output).toEqual([
      {
        code: 'invalid_string',
        message: 'invalid email',
        path: ['body', 'email'],
        validation: 'email',
      },
    ])
  })

  it('returns `400 Bad Request` error when sending a short password', async () => {
    const input = { email: faker.internet.email(), password: 'SHORT' }
    const { body: output } = await request.post('/api/auth/sign-in').send(input).expect(StatusCodes.BAD_REQUEST)
    expect(output).toEqual([
      {
        code: 'too_small',
        message: 'password must be at least 8 characters long',
        minimum: 8,
        exact: false,
        inclusive: true,
        path: ['body', 'password'],
        type: 'string',
      },
    ])
  })

  it('returns `422 Unprocessable Entity` error with `invalid email or password` message on sending wrong password', async () => {
    const input = { email: faker.internet.email(), password: faker.internet.password() }
    const { body: output } = await request
      .post('/api/auth/sign-in')
      .send({ ...input, password: 'wrong-password' })
      .expect(StatusCodes.UNPROCESSABLE_ENTITY)
    expect(output).toEqual(expect.objectContaining({ message: expect.any(String) }))
    expect(output.message).toEqual('invalid email or password')
  })
})

describe('POST /api/auth/verify', () => {
  it('returns `200 OK` when the token is valid', async () => {
    const accessToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG4uZG9lQGVtYWlsLmNvbSIsImlhdCI6MTY4MTA0NTIwMDAwMCwiZXhwIjoxOTk2NDA1MjAwMDAwfQ.NSHEzWBPUXM6qvw48k7PpijBx8iv-epyXZneCeIuJm4'
    const { body: output } = await request.post('/api/auth/verify').send({ accessToken }).expect(StatusCodes.OK)
    expect(output.email).toBe('john.doe@email.com')
    expect(output.iat).toBe(1681045200000)
    expect(output.exp).toBe(1996405200000)
  })

  it('returns `422 Unprocessable Entity` error with `invalid token` message', async () => {
    const removedFiveFirstCharactersJwt =
      'GciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG4uZG9lQGVtYWlsLmNvbSIsImlhdCI6MTY4MTA0NTIwMDAwMCwiZXhwIjoxOTk2NDA1MjAwMDAwfQ.NSHEzWBPUXM6qvw48k7PpijBx8iv-epyXZneCeIuJm4'
    const { body: output } = await request
      .post('/api/auth/verify')
      .send({ accessToken: removedFiveFirstCharactersJwt })
      .expect(StatusCodes.UNPROCESSABLE_ENTITY)
    expect(output.message).toBe('invalid token')
  })

  it('returns `400 Bad Request` error with `access token is required` message when sending an empty input', async () => {
    const { body: output } = await request.post('/api/auth/verify').send({}).expect(StatusCodes.BAD_REQUEST)
    expect(output).toEqual([
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'undefined',
        path: ['body', 'accessToken'],
        message: 'access token is required',
      },
    ])
  })
})

describe('POST /api/auth/refresh', () => {
  it('returns `201 Created` when the validation token is correct', async () => {
    const input = { email: faker.internet.email(), password: faker.internet.password() }
    await request.post('/api/auth/sign-up').send(input).expect(StatusCodes.ACCEPTED)
    const { body: signInOutput } = await request.post('/api/auth/sign-in').send(input).expect(StatusCodes.OK)
    const { body: output } = await request
      .post('/api/auth/refresh')
      .send({ refreshToken: signInOutput.refreshToken })
      .expect(StatusCodes.CREATED)
    expect(output).toEqual(
      expect.objectContaining({
        accessToken: expect.any(String),
      }),
    )
  })

  it('returns `422 Unprocessable Entity` error with `invalid refresh token` message when refresh token is not found', async () => {
    const refreshToken =
      'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJyZWZyZXNoVG9rZW5VdWlkIjoiNTNjOWRiZWEtN2M1NS00YTk4LWIyMGYtMmFlNjRjMzI4MjhhIiwiaWF0IjoxNjg0NjgxMzc5NzkxLCJleHAiOjE2ODU1NDUzNzk3OTF9.dhLuC9FJIUs6wNUZCCxmFjerdbytvUFIsI9JdpBjxgCpFH4nB60NQZe6aV89AVs_FDlmEEapZBPuCSk60iiPtw'
    const { body: output } = await request
      .post('/api/auth/refresh')
      .send({ refreshToken })
      .expect(StatusCodes.UNPROCESSABLE_ENTITY)
    expect(output.message).toEqual('invalid refresh token')
  })
})
