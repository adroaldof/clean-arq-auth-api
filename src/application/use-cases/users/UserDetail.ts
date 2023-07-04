import { UseCase } from '../UseCase'
import { UserOutput } from '@/entities/user/User'
import { UserRepository } from '@/ports/UserRepository'

export class UserDetail implements UseCase {
  constructor(readonly usersRepository: UserRepository) {}

  async execute(input: UserDetailInput): Promise<UserOutput | null> {
    const authenticatedUser = await this.usersRepository.getByUuid(input.userUuid)
    return authenticatedUser ? authenticatedUser.toString() : null
  }
}

type UserDetailInput = {
  userUuid: string
}
