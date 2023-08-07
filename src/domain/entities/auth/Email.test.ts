import { Email } from './Email'
import { faker } from '@faker-js/faker'
import { expect, it } from 'vitest'

it('creates an email object with a valid email', () => {
  const mockedEmail = faker.internet.email()
  const email = new Email({ email: mockedEmail })
  expect(email.getValue()).toBe(mockedEmail)
})

it('returns `invalid email` exception when the email is malformed', () => {
  expect(() => new Email({ email: 'invalid@email' })).toThrow(new Error('invalid email'))
})
