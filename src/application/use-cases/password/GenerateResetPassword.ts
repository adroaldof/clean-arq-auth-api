import { ResetPassword } from '@/entities/auth/ResetPassword'
import { ResetPasswordPort } from '@/ports/ResetPasswordPort'
import { UserRepository } from '@/ports/UserRepository'

const secureResetPasswordMessage = 'a confirmation email has been sent to your registered email address'

export class GenerateResetPassword {
  constructor(readonly usersRepository: UserRepository, readonly resetPasswordRepository: ResetPasswordPort) {}

  async execute(input: ResetPasswordInput): Promise<ResetPasswordOutput> {
    const user = await this.usersRepository.getByEmail(input.email)
    if (!user) return { message: secureResetPasswordMessage }
    const passwordReset = new ResetPassword({ userUuid: user.uuid })
    const uuid = await this.resetPasswordRepository.save(passwordReset)
    return { message: secureResetPasswordMessage, token: uuid }
  }
}

type ResetPasswordInput = {
  email: string
}

type ResetPasswordOutput = {
  message: string
  token?: string
}
