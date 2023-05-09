import { Auth } from './Auth'
import { expect, it } from 'vitest'
import { TokenGenerator } from './TokenGenerator'

const derivedToken =
  'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG4uZG9lQGVtYWlsLmNvbSIsImlhdCI6MTY4MTA0NTIwMDAwMCwiZXhwIjoxOTk2NDA1MjAwMDAwfQ.7b28E5HZBNf8Ze-eXzP5RLIvIbK_4evoJ1RDa88TqPuYQXzAvEL8xgsrbV5dbAn9dIG25j1H3yeA0pAb6iZSDg'

const secretOrPrivateKey = 'key'

const authPayload = {
  email: 'john.doe@email.com',
  password: 'abc123',
}

it('generates a new token for an user', async () => {
  const expiresIn = 60 * 60 * 24 * 365 * 10 * 1000 // 10 years for test purpose only (seconds * minutes * hours * days * years * multiplier)
  const issueDate = new Date('2023-04-09T10:00:00')
  const tokenGenerator = new TokenGenerator(secretOrPrivateKey)
  const authUser = await Auth.create(authPayload.email, authPayload.password)
  const output = tokenGenerator.generate(authUser, issueDate, expiresIn)
  expect(output).toBe(derivedToken)
})

it('verifies the user token content', () => {
  const tokenGenerator = new TokenGenerator(secretOrPrivateKey)
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

it('returns `invalid token` exception when try to validate a malformed token', () => {
  const tokenGenerator = new TokenGenerator(secretOrPrivateKey)
  const invalidToken = derivedToken.substring(5) // remove 5 characters from the beginning
  expect(() => tokenGenerator.verify(invalidToken)).toThrow('invalid token')
})
