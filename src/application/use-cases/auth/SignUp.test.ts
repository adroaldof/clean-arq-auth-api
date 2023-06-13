import { expect, it, vi } from 'vitest'
import { faker } from '@faker-js/faker'
import { mockUserRepository } from '@/ports/UserRepository.mocks'
import { SignUp } from './SignUp'

const mockedEmail = faker.internet.email()
const mockedPassword = faker.internet.password()

it('calls save on auth repository on creating a new user account', async () => {
  const usersRepository = mockUserRepository()
  const saveAuthSpy = vi.spyOn(usersRepository, 'save')
  const signUp = new SignUp(usersRepository)
  const input = { email: mockedEmail, password: mockedPassword }
  await signUp.execute(input)
  expect(saveAuthSpy).toBeCalled()
})
