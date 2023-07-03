import { RefreshTokenRepository } from '@/ports/RefreshTokenRepository'

export class SignOut {
  constructor(readonly refreshTokenRepository: RefreshTokenRepository) {}

  async execute(input: SignOutInput): Promise<void> {
    await this.refreshTokenRepository.invalidateByUserUuid(input.authenticatedUserUuid)
  }
}

type SignOutInput = {
  authenticatedUserUuid: string
}
