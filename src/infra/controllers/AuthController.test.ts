import supertest, { SuperTest, Test } from 'supertest'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AuthController } from './AuthController'
import { AuthRepositoryDatabase } from '@/repositories/AuthRepositoryDatabase'
import { ExpressHttpServer } from '@/http/ExpressHttpServer'
import { faker } from '@faker-js/faker'
import { KnexAdapter } from '@/database/KnexAdapter'
import { SignIn } from '@/use-cases/auth/SignIn'
import { SignUp } from '@/use-cases/auth/SignUp'
import { StatusCodes } from 'http-status-codes'
import { tableNames } from '@/database/table-names'

const httpServer = new ExpressHttpServer()
const connection = new KnexAdapter()

const authRepository = new AuthRepositoryDatabase(connection)
const signUp = new SignUp(authRepository)
const signIn = new SignIn(authRepository)
new AuthController(httpServer, signUp, signIn)

const request: SuperTest<Test> = supertest(httpServer.server)

beforeEach(async () => {
  await connection.migrate()
})

afterEach(async () => {
  await connection.rollback()
})

describe('POST /api/sign-up', () => {
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

  it('returns `400 Bad Request` when sending an empty payload', async () => {
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

describe('POST /api/sign-in', () => {
  it('returns the access token when the user and password are valid', async () => {
    const input = { email: faker.internet.email(), password: faker.internet.password() }
    await request.post('/api/auth/sign-up').send(input).expect(StatusCodes.ACCEPTED)
    const { body: output } = await request.post('/api/auth/sign-in').send(input).expect(StatusCodes.OK)
    expect(output).toEqual(expect.objectContaining({ accessToken: expect.any(String) }))
  })

  it('returns `400 Bad Request` error when sending an empty payload', async () => {
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
