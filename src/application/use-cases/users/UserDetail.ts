import { UseCase } from '../UseCase'
import { UserOutput } from '@/entities/user/User'
import { UserRepository } from '@/ports/UserRepository'

export class UserDetail implements UseCase {
  constructor(readonly usersRepository: UserRepository) {}

  async execute(input: UserDetailInput): Promise<UserOutput> {
    const foundUser = await this.usersRepository.getByUuid(input.userUuid)
    if (!foundUser) throw new Error('user not found')
    return foundUser.toJson()
  }
}

type UserDetailInput = {
  userUuid: string
}
