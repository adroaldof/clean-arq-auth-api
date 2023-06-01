import { AuthOutput } from '@/entities/auth/Auth'
import { AuthRepository } from '@/ports/AuthRepository'
import { config } from '@/config'
import { TokenGenerator } from '@/entities/auth/TokenGenerator'

export class GetMe {
  constructor(readonly authRepository: AuthRepository) {}

  async execute(input: Input): Promise<AuthOutput | null> {
    const tokenGenerator = new TokenGenerator(config.token.signKey)
    const decodedToken = tokenGenerator.verify(input.accessToken)
    const authUser = await this.authRepository.get(decodedToken.email)
    return authUser ? authUser.toString() : null
  }
}

type Input = {
  accessToken: string
}
