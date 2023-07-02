import { RefreshTokenRepository } from '@/ports/RefreshTokenRepository'

export class SignOut {
  constructor(readonly refreshTokenRepository: RefreshTokenRepository) {}

  async execute(input: SignOutInput): Promise<void> {
    const refreshToken = await this.refreshTokenRepository.getByUuid(input.uuid)
    if (!refreshToken) throw new Error('refresh token not found')
    await this.refreshTokenRepository.invalidateRefreshToken(input.uuid)
  }
}

type SignOutInput = {
  uuid: string
}
