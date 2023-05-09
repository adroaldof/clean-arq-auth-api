import { Auth } from '@/entities/auth/Auth'
import { AuthRepository } from '@/ports/AuthRepository'
import { TokenGenerator } from '@/entities/auth/TokenGenerator'

export class SignIn {
  constructor(readonly authRepository: AuthRepository) {}

  async execute(input: SignInInput): Promise<SignInOutput> {
    const authUser = await this.authRepository.get(input.email)
    if (!authUser) throw new Error('invalid email or password')
    const builtUser = await Auth.buildExistingAuthUser(
      authUser.getEmail().getValue(),
      authUser.password.getValue(),
      authUser.password.getSalt(),
    )
    const tokenGenerator = new TokenGenerator('key')
    const accessToken = tokenGenerator.generate(builtUser)
    return { accessToken }
  }
}

type SignInInput = {
  email: string
  password: string
}

type SignInOutput = {
  accessToken: string
}
