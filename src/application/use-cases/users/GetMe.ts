import { UseCase } from '../UseCase'
import { UserOutput } from '@/entities/user/User'
import { UserRepository } from '@/ports/UserRepository'

export class GetMe implements UseCase {
  constructor(readonly usersRepository: UserRepository) {}

  async execute(input: Input): Promise<UserOutput | null> {
    const authenticatedUser = await this.usersRepository.getByUuid(input.authenticatedUserUuid)
    return authenticatedUser ? authenticatedUser.toString() : null
  }
}

type Input = {
  authenticatedUserUuid: string
}
