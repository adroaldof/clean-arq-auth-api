import { Password } from '@/entities/auth/Password'
import { ResetPasswordPort } from '@/ports/ResetPasswordPort'
import { UserRepository } from '@/ports/UserRepository'

export class UpdatePassword {
  constructor(readonly resetPasswordRepository: ResetPasswordPort, readonly usersRepository: UserRepository) {}

  async execute(input: UpdatePasswordInput): Promise<void> {
    if (input.password !== input.confirmPassword) throw Error("password don't match")
    const resetPassword = await this.resetPasswordRepository.getByUuid(input.token)
    if (!resetPassword) throw new Error('invalid reset password token')
    await this.resetPasswordRepository.invalidateByUserUuid(resetPassword.userUuid)
    const password = await Password.create({ password: input.password })
    await this.usersRepository.updatePassword(resetPassword.userUuid, password)
  }
}

export type UpdatePasswordInput = {
  token: string
  password: string
  confirmPassword: string
}
