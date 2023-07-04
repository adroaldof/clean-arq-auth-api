import { UseCase } from '../UseCase'
import { UserOutput } from '@/entities/user/User'
import { UserRepository } from '@/ports/UserRepository'

export class UpdateUser implements UseCase {
  constructor(readonly usersRepository: UserRepository) {}

  async execute(input: UpdateUserInput): Promise<void> {
    const foundUser = await this.usersRepository.getByUuid(input.userUuid)
    if (!foundUser) throw new Error('user not found')
    foundUser.update(input)
    await this.usersRepository.update(foundUser)
  }
}

type UpdateUserInput = {
  userUuid: string
  name?: string
  email?: string
  profilePictureUrl?: string
}
