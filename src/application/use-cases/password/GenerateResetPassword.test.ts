import { expect, it, vi } from 'vitest'
import { faker } from '@faker-js/faker'
import { GenerateResetPassword } from './GenerateResetPassword'
import { mockResetPasswordRepository } from '@/ports/ResetPasswordPort.mocks'
import { mockUserRepository } from '@/ports/UserRepository.mocks'

it('returns `a confirmation email has been sent to your registered email address` when the user is not found (security)', async () => {
  const usersRepository = mockUserRepository({ getByEmail: async () => null })
  const passwordResetPasswordRepository = mockResetPasswordRepository()
  const generateResetPasswordToken = new GenerateResetPassword(usersRepository, passwordResetPasswordRepository)
  const output = await generateResetPasswordToken.execute({ email: faker.internet.email() })
  expect(output.message).toEqual('a confirmation email has been sent to your registered email address')
})

it('returns `a confirmation email has been sent to your registered email address` when the password token is created', async () => {
  const usersRepository = mockUserRepository()
  const passwordResetPasswordRepository = mockResetPasswordRepository()
  const passwordResetPasswordRepositorySpy = vi.spyOn(passwordResetPasswordRepository, 'save')
  const generateResetPasswordToken = new GenerateResetPassword(usersRepository, passwordResetPasswordRepository)
  const output = await generateResetPasswordToken.execute({ email: faker.internet.email() })
  expect(passwordResetPasswordRepositorySpy).toBeCalled()
  expect(output.message).toEqual('a confirmation email has been sent to your registered email address')
})
