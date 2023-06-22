import { expect, it, vi } from 'vitest'
import { faker } from '@faker-js/faker'
import { mockResetPasswordRepository } from '@/ports/ResetPasswordPort.mocks'
import { mockUserRepository } from '@/ports/UserRepository.mocks'
import { UpdatePassword, UpdatePasswordInput } from './UpdatePassword'

it("throws `password don't match` when password and confirm password are different", async () => {
  const passwordResetPasswordRepository = mockResetPasswordRepository()
  const usersRepository = mockUserRepository()
  const generateResetPasswordToken = new UpdatePassword(passwordResetPasswordRepository, usersRepository)
  const input = generateInput({ confirmPassword: faker.internet.password() })
  expect(() => generateResetPasswordToken.execute(input)).rejects.toThrow(new Error("password don't match"))
})

it('throws `invalid reset password token` when no password is found', async () => {
  const passwordResetPasswordRepository = mockResetPasswordRepository({ getByUuid: () => Promise.resolve(null) })
  const usersRepository = mockUserRepository()
  const generateResetPasswordToken = new UpdatePassword(passwordResetPasswordRepository, usersRepository)
  const input = generateInput()
  expect(() => generateResetPasswordToken.execute(input)).rejects.toThrow(new Error('invalid reset password token'))
})

it('expect to calls', async () => {
  const passwordResetPasswordRepository = mockResetPasswordRepository()
  const passwordResetPasswordRepositorySpy = vi.spyOn(passwordResetPasswordRepository, 'invalidateByUserUuid')
  const usersRepository = mockUserRepository()
  const usersRepositorySpy = vi.spyOn(usersRepository, 'updatePassword')
  const generateResetPasswordToken = new UpdatePassword(passwordResetPasswordRepository, usersRepository)
  const input = generateInput()
  await generateResetPasswordToken.execute(input)
  expect(passwordResetPasswordRepositorySpy).toHaveBeenCalled()
  expect(usersRepositorySpy).toHaveBeenCalled()
})

const generateInput = (overrides?: Partial<UpdatePasswordInput>): UpdatePasswordInput => {
  const password = faker.internet.password()
  return { token: faker.datatype.uuid(), password, confirmPassword: password, ...overrides }
}
