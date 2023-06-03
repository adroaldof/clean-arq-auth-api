import { AuthOutput } from '@/entities/auth/Auth'
import { AuthRepository } from '@/ports/AuthRepository'
import { UseCase } from '../UseCase'

export class GetMe implements UseCase {
  constructor(readonly authRepository: AuthRepository) {}

  async execute(input: Input): Promise<AuthOutput | null> {
    const authUser = await this.authRepository.get(input.email)
    return authUser ? authUser.toString() : null
  }
}

type Input = {
  email: string
}
