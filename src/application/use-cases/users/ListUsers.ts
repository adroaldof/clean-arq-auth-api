import { AuthOutput } from '@/entities/auth/Auth'
import { AuthRepository } from '@/ports/AuthRepository'
import { UseCase } from '../UseCase'

export class ListUsers implements UseCase {
  constructor(readonly authRepository: AuthRepository) {}

  async execute(): Promise<AuthOutput[]> {
    const users = await this.authRepository.list()
    return users.map((user) => user.toString())
  }
}
