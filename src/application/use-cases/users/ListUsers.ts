import { UseCase } from '../UseCase';
import { UserOutput } from '@/entities/user/User';
import { UserRepository } from '@/ports/UserRepository';

export class ListUsers implements UseCase {
  constructor(readonly usersRepository: UserRepository) {}

  async execute(): Promise<UserOutput[]> {
    const users = await this.usersRepository.list()
    return users.map((user) => user.toString())
  }
}
