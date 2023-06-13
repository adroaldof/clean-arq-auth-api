import { config } from '@/config'
import { RefreshTokenRepository } from '@/ports/RefreshTokenRepository'
import { TokenGenerator } from '@/entities/auth/TokenGenerator'
import { User } from '@/entities/auth/User'
import { UserRepository } from '@/ports/UserRepository'

export class SignIn {
  constructor(readonly usersRepository: UserRepository, readonly refreshTokenRepository: RefreshTokenRepository) {}

  async execute(input: SignInInput): Promise<SignInOutput> {
    const authUser = await this.usersRepository.get(input.email)
    if (!authUser) throw new Error('invalid email or password')
    const hydratedUser = await User.hydrateUser(
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
