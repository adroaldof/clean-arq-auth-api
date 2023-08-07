import { expect, it } from 'vitest'
import { faker } from '@faker-js/faker'
import { mockUser, mockUserInput } from './User.mocks'
import { User } from './User'

const mockedEmail = faker.internet.email()

it('creates a new authentication user', async () => {
  const mockedPassword = faker.internet.password()
  const userInput = mockUserInput({ email: mockedEmail, password: mockedPassword })
  const user = await User.create(userInput)
  const isValidPassword = await user.isValidPassword(mockedPassword)
  expect(user.getEmail().getValue()).toBe(mockedEmail)
  expect(isValidPassword).toBeTruthy()
})

it('validates the user password', async () => {
  const salt = 'salt'
  const clearPassword = 'abc123'
  const derivedPassword =
    'bd2615764cdf90d3f7467d0de0ca5e5cc87eaedf03471a462c354767e8ded32658a99116d16a2d45dca94a723d3535019125459b9dbaeb53960d8c11283289c2'
  const auth = await User.hydrateUser({ email: mockedEmail, password: derivedPassword, salt })
  const isValidPassword = await auth.isValidPassword(clearPassword)
  expect(isValidPassword).toBeTruthy()
})

it('expect user to have uui, email, name and profilePictureUrl', async () => {
  const email = faker.internet.email()
  const password = faker.internet.password()
  const name = faker.name.firstName()
  const profilePictureUrl = faker.image.imageUrl()
  const userInput = mockUserInput({ email, password, name, profilePictureUrl })
  const user = await User.create(userInput)
  expect(user.getName()).toBe(name)
  expect(user.getProfilePictureUrl()).toBe(profilePictureUrl)
})

it('updates the user', async () => {
  const userInput = mockUserInput()
  const user = await User.create(userInput)
  const newName = faker.name.firstName()
  const newEmail = faker.internet.email()
  const newProfilePictureUrl = faker.image.imageUrl()
  user.update({ name: newName, email: newEmail, profilePictureUrl: newProfilePictureUrl })
  expect(user.getName()).toBe(newName)
  expect(user.getProfilePictureUrl()).toBe(newProfilePictureUrl)
  expect(user.getEmail().getValue()).toBe(newEmail)
})

it('soft deletes the user', async () => {
  const user = await mockUser()
  user.delete()
  expect(user.status).toBe('deleted')
})
