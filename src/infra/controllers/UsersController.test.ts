import supertest, { SuperTest, Test } from 'supertest'
import { AuthController } from './AuthController'
import { AuthDecorator } from '@/decorators/AuthDecorator'
import { beforeEach, describe, expect, it } from 'vitest'
import { DeleteUser } from '@/use-cases/users/DeleteUser'
import { DetailUser } from '@/use-cases/users/DetailUser'
import { ExpressHttpServer } from '@/http/ExpressHttpServer'
import { faker } from '@faker-js/faker'
import { GenerateAuthTokenFromRefreshToken } from '@/use-cases/auth/GenerateAuthTokenFromRefreshToken'
import { GetMe } from '@/use-cases/users/GetMe'
import { KnexAdapter } from '@/database/KnexAdapter'
import { ListUsers } from '@/use-cases/users/ListUsers'
import { mockUser } from '@/entities/user/User.mocks'
import { RefreshTokenRepositoryDatabase } from '@/repositories/RefreshTokenRepositoryDatabase'
import { SignIn } from '@/use-cases/auth/SignIn'
import { SignOut } from '@/use-cases/auth/SignOut'
import { SignUp } from '@/use-cases/auth/SignUp'
import { StatusCodes } from 'http-status-codes'
import { tableNames } from '@/database/table-names.mjs'
import { UpdateUser } from '@/use-cases/users/UpdateUser'
import { User, UserOutput } from '@/entities/user/User'
import { UserRepositoryDatabase } from '@/repositories/UserRepositoryDatabase'
import { UsersController } from './UsersController'
import { VerifyToken } from '@/use-cases/auth/VerifyToken'

const connection = new KnexAdapter()

const httpServer = new ExpressHttpServer()

const usersRepository = new UserRepositoryDatabase(connection)
const refreshTokenRepository = new RefreshTokenRepositoryDatabase(connection)
const signUp = new SignUp(usersRepository)
const signIn = new SignIn(usersRepository, refreshTokenRepository)
const signOut = new AuthDecorator(new SignOut(refreshTokenRepository))
const verifyToken = new VerifyToken()
const generateAuthTokenFromRefreshToken = new GenerateAuthTokenFromRefreshToken(refreshTokenRepository, usersRepository)
new AuthController(httpServer, signUp, signIn, signOut, verifyToken, generateAuthTokenFromRefreshToken)

const getMe = new AuthDecorator(new GetMe(usersRepository))
const listUsers = new AuthDecorator(new ListUsers(usersRepository))
const detailUser = new AuthDecorator(new DetailUser(usersRepository))
const updateUser = new AuthDecorator(new UpdateUser(usersRepository))
const deleteUser = new AuthDecorator(new DeleteUser(usersRepository))
new UsersController(httpServer, listUsers, getMe, detailUser, updateUser, deleteUser)

const request: SuperTest<Test> = supertest(httpServer.server)

describe('GET /api/users', () => {
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
    expect(output).toBeInstanceOf(Array)
    const [createdUser] = output.filter((user: UserOutput) => user.email === input.email)
    expect(createdUser).toEqual(
      expect.objectContaining({
        uuid: expect.any(String),
        email: expect.any(String),
      }),
    )
  })

  it('returns `422 Unprocessable Entity` with `invalid token` message when remove part of token', async () => {
    const { body: output } = await request
      .get('/api/users')
      .set({ Authorization: `Bearer NOT_A_TOKEN` })
      .expect(StatusCodes.UNPROCESSABLE_ENTITY)
    expect(output.message).toEqual('not authenticated')
  })
})

describe('GET /api/users/me', () => {
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

describe('GET /api/users/:uuid', () => {
  let user: User

  beforeEach(async () => {
    user = await mockUser()
    await connection
      .connection(tableNames.users)
      .insert({ ...user.toJson(), password: faker.internet.password(), salt: faker.random.alphaNumeric(16) })
  })

  it('returns `200 OK` with the users list when authenticated', async () => {
    const input = { email: faker.internet.email(), password: faker.internet.password() }
    await request.post('/api/auth/sign-up').send(input).expect(StatusCodes.ACCEPTED)
    const { body: authenticated } = await request.post('/api/auth/sign-in').send(input).expect(StatusCodes.OK)
    const { body: output } = await request
      .get(`/api/users/${user.uuid}`)
      .set({ Authorization: `Bearer ${authenticated.accessToken}` })
      .expect(StatusCodes.OK)
    expect(output).toBeInstanceOf(Object)
    expect(output.email).toBe(user.email.getValue())
  })

  it('returns `422 Unprocessable Entity` with `invalid token` message when remove part of token', async () => {
    const { body: output } = await request
      .get(`/api/users/${user.uuid}`)
      .set({ Authorization: `Bearer NOT_A_TOKEN` })
      .expect(StatusCodes.UNPROCESSABLE_ENTITY)
    expect(output.message).toEqual('not authenticated')
  })
})

describe('PUT /api/users/:uuid', () => {
  let user: User

  beforeEach(async () => {
    user = await mockUser()
    await connection
      .connection(tableNames.users)
      .insert({ ...user.toJson(), password: faker.internet.password(), salt: faker.random.alphaNumeric(16) })
  })

  it('returns `200 OK` with an empty response', async () => {
    const input = { email: faker.internet.email(), password: faker.internet.password() }
    await request.post('/api/auth/sign-up').send(input).expect(StatusCodes.ACCEPTED)
    const { body: authenticated } = await request.post('/api/auth/sign-in').send(input).expect(StatusCodes.OK)
    const name = faker.name.fullName()
    await request
      .put(`/api/users/${user.uuid}`)
      .send({ name })
      .set({ Authorization: `Bearer ${authenticated.accessToken}` })
      .expect(StatusCodes.OK)
    const updatedUser = await connection.connection(tableNames.users).where({ uuid: user.uuid }).first()
    expect(updatedUser.name).toBe(name)
  })

  it('returns `422 Unprocessable Entity` with `invalid token` message when remove part of token', async () => {
    await request
      .put(`/api/users/${user.uuid}`)
      .send({ name: faker.name.fullName() })
      .set({ Authorization: `Bearer NOT_A_TOKEN` })
      .expect(StatusCodes.UNPROCESSABLE_ENTITY)
  })
})

describe('DELETE /api/users/:uuid', () => {
  let user: User

  beforeEach(async () => {
    user = await mockUser()
    await connection
      .connection(tableNames.users)
      .insert({ ...user.toJson(), password: faker.internet.password(), salt: faker.random.alphaNumeric(16) })
  })

  it('returns `200 OK` with an empty response', async () => {
    const input = { email: faker.internet.email(), password: faker.internet.password() }
    await request.post('/api/auth/sign-up').send(input).expect(StatusCodes.ACCEPTED)
    const { body: authenticated } = await request.post('/api/auth/sign-in').send(input).expect(StatusCodes.OK)
    await request
      .delete(`/api/users/${user.uuid}`)
      .set({ Authorization: `Bearer ${authenticated.accessToken}` })
      .expect(StatusCodes.OK)
    const deletedUser = await connection.connection(tableNames.users).where({ uuid: user.uuid }).first()
    expect(deletedUser.status).toBe('deleted')
  })

  it('returns `422 Unprocessable Entity` with `invalid token` message when remove part of token', async () => {
    await request
      .delete(`/api/users/${user.uuid}`)
      .set({ Authorization: `Bearer NOT_A_TOKEN` })
      .expect(StatusCodes.UNPROCESSABLE_ENTITY)
  })
})
