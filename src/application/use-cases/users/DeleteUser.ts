import { UseCase } from '../UseCase'
import { UserRepository } from '@/ports/UserRepository'

export class DeleteUser implements UseCase {
  constructor(readonly usersRepository: UserRepository) {}

  async execute(input: UpdateUserInput): Promise<void> {
    const foundUser = await this.usersRepository.getByUuid(input.userUuid)
    if (!foundUser) throw new Error('user not found')
    foundUser.delete()
    await this.usersRepository.delete(foundUser.uuid)
  }
}

type UpdateUserInput = {
  userUuid: string
}
