import { UseCase } from '../UseCase'
import { UserOutput } from '@/entities/user/User'
import { UserRepository } from '@/ports/UserRepository'

export class DetailUser implements UseCase {
  constructor(readonly usersRepository: UserRepository) {}

  async execute(input: DetailUserInput): Promise<UserOutput> {
    const foundUser = await this.usersRepository.getByUuid(input.userUuid)
    if (!foundUser) throw new Error('user not found')
    return foundUser.toJson()
  }
}

type DetailUserInput = {
  userUuid: string
}
