import supertest, { SuperTest, Test } from 'supertest';
import { AuthController } from './AuthController';
import { AuthRepositoryDatabase } from '@/infra/repositories/AuthRepositoryDatabase';
import { ExpressHttpServer } from '@/http/ExpressHttpServer';
import { faker } from '@faker-js/faker';
import { KnexAdapter } from '@/database/KnexAdapter';
import { SignUp } from '@/use-cases/auth/SignUp';
import { StatusCodes } from 'http-status-codes';
import { tableNames } from '@/database/table-names';

const httpServer = new ExpressHttpServer()
const connection = new KnexAdapter()

const authRepository = new AuthRepositoryDatabase(connection)

const signUp = new SignUp(authRepository)

new AuthController(httpServer, signUp)

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
