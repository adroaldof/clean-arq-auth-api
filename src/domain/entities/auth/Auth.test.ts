import { Auth } from './Auth'
import { expect, it } from 'vitest'
import { faker } from '@faker-js/faker'

const mockedEmail = faker.internet.email()

it('creates a new authentication user', async () => {
  const mockedPassword = faker.internet.password()
  const auth = await Auth.create(mockedEmail, mockedPassword)
  const isValidPassword = await auth.isValidPassword(mockedPassword)
  expect(auth.getEmail().getValue()).toBe(mockedEmail)
  expect(isValidPassword).toBeTruthy()
})

it('validates the user password', async () => {
  const salt = 'salt'
  const clearPassword = 'abc123'
  const derivedPassword =
    'bd2615764cdf90d3f7467d0de0ca5e5cc87eaedf03471a462c354767e8ded32658a99116d16a2d45dca94a723d3535019125459b9dbaeb53960d8c11283289c2'
  const auth = await Auth.buildExistingAuthUser(mockedEmail, derivedPassword, salt)
  const isValidPassword = await auth.isValidPassword(clearPassword)
  expect(isValidPassword).toBeTruthy()
})

it('expect user to have uui, email, name and profilePictureUrl', async () => {
  const email = faker.internet.email()
  const password = faker.internet.password()
  const name = faker.name.firstName()
  const profilePictureUrl = faker.image.imageUrl()
  const user = await Auth.create(email, password, name, profilePictureUrl)
  expect(user.getName()).toBe(name)
  expect(user.getProfilePictureUrl()).toBe(profilePictureUrl)
})
