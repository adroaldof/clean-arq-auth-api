import { beforeEach, expect, it } from 'vitest';
import { TokenGenerator } from './TokenGenerator';
import { User } from '../user/User';

const secretOrPrivateKey = 'key'
const expiresIn = 60 * 60 * 24 * 365 * 10 * 1000 // 10 years for test purpose only (seconds * minutes * hours * days * years * multiplier)
const issueDate = new Date('2023-04-09T10:00:00')

const authPayload = {
  email: 'john.doe@email.com',
  password: 'abc123',
}

let authUser: User

beforeEach(async () => {
  authUser = await User.create(authPayload.email, authPayload.password)
})

it('generates a new token for an user', async () => {
  const tokenGenerator = new TokenGenerator(secretOrPrivateKey)
  const output = tokenGenerator.generateAuthToken(authUser, issueDate, expiresIn)
  expect(output).toEqual(expect.any(String))
})

it('verifies the user token content', async () => {
  const tokenGenerator = new TokenGenerator(secretOrPrivateKey)
  const derivedToken = tokenGenerator.generateAuthToken(authUser, issueDate, expiresIn)
  const output = tokenGenerator.verify(derivedToken)
  expect(output).toEqual(
    expect.objectContaining({
      email: expect.any(String),
      iat: expect.any(Number),
      exp: expect.any(Number),
    }),
  )
  expect(output.email).toBe(authPayload.email)
})

it('returns `invalid token` exception when try to validate a malformed token', async () => {
  const tokenGenerator = new TokenGenerator(secretOrPrivateKey)
  const derivedToken = tokenGenerator.generateAuthToken(authUser, issueDate, expiresIn)
  const invalidToken = derivedToken.substring(5) // remove 5 characters from the beginning
  expect(() => tokenGenerator.verify(invalidToken)).toThrow('invalid token')
})

it('returns a validation output with uuid, refresh token and expires at date', async () => {
  const tokenGenerator = new TokenGenerator(secretOrPrivateKey)
  const output = tokenGenerator.generateRefreshToken()
  expect(output).toEqual(
    expect.objectContaining({
      uuid: expect.any(String),
      refreshToken: expect.any(String),
      expiresAt: expect.any(Number),
    }),
  )
})
