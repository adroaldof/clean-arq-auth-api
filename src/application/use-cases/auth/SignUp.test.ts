import { expect, it, vi } from 'vitest'
import { faker } from '@faker-js/faker'
import { mockAuthRepository } from '@/ports/AuthRepository.mocks'
import { SignUp } from './SignUp'

const mockedEmail = faker.internet.email()
const mockedPassword = faker.internet.password()

it('calls save on auth repository on creating a new user account', async () => {
  const authRepository = mockAuthRepository()
  const saveAuthSpy = vi.spyOn(authRepository, 'save')
  const signUp = new SignUp(authRepository)
  const input = { email: mockedEmail, password: mockedPassword }
  await signUp.execute(input)
  expect(saveAuthSpy).toBeCalled()
})
