import { config } from '@/config'
import { JwtTokenGenerator } from '@/entities/token/JwtTokenGenerator'
import { RefreshTokenRepository } from '@/ports/RefreshTokenRepository'
import { UserRepository } from '@/ports/UserRepository'

export class GenerateAuthTokenFromRefreshToken {
  constructor(readonly refreshTokenRepository: RefreshTokenRepository, readonly usersRepository: UserRepository) {}

  async execute(input: GenerateAuthTokenFromRefreshTokenInput) {
    const tokenGenerator = new JwtTokenGenerator(config.token.signKey)
    const token = tokenGenerator.verify(input.refreshToken)
    const refreshToken = await this.refreshTokenRepository.getByUuid(token.refreshTokenUuid)
    if (!refreshToken) throw new Error('invalid refresh token')
    const user = await this.usersRepository.get(refreshToken.userEmail)
    if (!user) throw new Error('invalid refresh token')
    const accessToken = tokenGenerator.generateAuthToken(user)
    return { accessToken }
  }
}

type GenerateAuthTokenFromRefreshTokenInput = {
  refreshToken: string
}
