import { AuthRepository } from '@/ports/AuthRepository'
import { config } from '@/config'
import { RefreshTokenRepository } from '@/ports/RefreshTokenRepository'
import { TokenGenerator } from '@/entities/auth/TokenGenerator'

export class GenerateAuthTokenFromRefreshToken {
  constructor(readonly refreshTokenRepository: RefreshTokenRepository, readonly authRepository: AuthRepository) {}

  async execute(input: GenerateAuthTokenFromRefreshTokenInput) {
    const tokenGenerator = new TokenGenerator(config.token.signKey)
    const token = tokenGenerator.verify(input.refreshToken)
    const refreshToken = await this.refreshTokenRepository.get(token.refreshTokenUuid)
    if (!refreshToken) throw new Error('invalid refresh token')
    const user = await this.authRepository.get(refreshToken.userEmail)
    if (!user) throw new Error('invalid refresh token')
    const accessToken = tokenGenerator.generateAuthToken(user)
    return { accessToken }
  }
}

type GenerateAuthTokenFromRefreshTokenInput = {
  refreshToken: string
}
