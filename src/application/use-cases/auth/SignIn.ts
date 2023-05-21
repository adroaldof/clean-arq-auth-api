import { Auth } from '@/entities/auth/Auth'
import { AuthRepository } from '@/ports/AuthRepository'
import { config } from '@/config'
import { RefreshTokenRepository } from '@/ports/RefreshTokenRepository'
import { TokenGenerator } from '@/entities/auth/TokenGenerator'

export class SignIn {
  constructor(readonly authRepository: AuthRepository, readonly refreshTokenRepository: RefreshTokenRepository) {}

  async execute(input: SignInInput): Promise<SignInOutput> {
    const authUser = await this.authRepository.get(input.email)
    if (!authUser) throw new Error('invalid email or password')
    const hydratedUser = await Auth.buildExistingAuthUser(
      authUser.getEmail().getValue(),
      authUser.password.getValue(),
      authUser.password.getSalt(),
    )
    const tokenGenerator = new TokenGenerator(config.token.signKey)
    const accessToken = tokenGenerator.generateAuthToken(hydratedUser)
    const { uuid, refreshToken, expiresAt } = tokenGenerator.generateRefreshToken()
    await this.refreshTokenRepository.save({
      uuid,
      userEmail: hydratedUser.getEmail().getValue(),
      expiresAt: new Date(expiresAt),
    })
    return { accessToken, refreshToken }
  }
}

type SignInInput = {
  email: string
  password: string
}

type SignInOutput = {
  accessToken: string
  refreshToken: string
}
