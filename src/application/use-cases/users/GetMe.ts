import { UseCase } from '../UseCase'
import { UserOutput } from '@/entities/auth/User'
import { UserRepository } from '@/ports/UserRepository'

export class GetMe implements UseCase {
  constructor(readonly usersRepository: UserRepository) {}

  async execute(input: Input): Promise<UserOutput | null> {
    const authUser = await this.usersRepository.get(input.userEmail)
    return authUser ? authUser.toString() : null
  }
}

type Input = {
  userEmail: string
}
