import { expect, it } from 'vitest'
import { Password } from './Password'

const salt = 'salt'
const clearPassword = 'abc123'
const derivedPassword =
  'bd2615764cdf90d3f7467d0de0ca5e5cc87eaedf03471a462c354767e8ded32658a99116d16a2d45dca94a723d3535019125459b9dbaeb53960d8c11283289c2'

it('creates a new password object', async () => {
  const password = await Password.create(clearPassword)
  expect(password.getValue()).toBeDefined()
  expect(password.getSalt()).toBeDefined()
})

it('creates a new password object with a salt', async () => {
  const password = await Password.create(clearPassword, salt)
  expect(password.getValue()).toBe(derivedPassword)
  expect(password.getSalt()).toBe(salt)
})

it('validates a clear password from a derived password and salt', async function () {
  const password = new Password(derivedPassword, salt)
  const isValid = await password.validate(clearPassword)
  expect(isValid).toBeTruthy()
})
