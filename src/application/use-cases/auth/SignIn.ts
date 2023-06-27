import { config } from '@/config'
import { RefreshTokenRepository } from '@/ports/RefreshTokenRepository'
import { TokenGenerator } from '@/entities/token/TokenGenerator'
import { User } from '@/entities/user/User'
import { UserRepository } from '@/ports/UserRepository'

export class SignIn {
  constructor(readonly usersRepository: UserRepository, readonly refreshTokenRepository: RefreshTokenRepository) {}

  async execute(input: SignInInput): Promise<SignInOutput> {
    const user = await this.usersRepository.get(input.email)
    if (!user) throw new Error('invalid email or password')
    const isValidPassword = await user.isValidPassword(input.password)
    if (!isValidPassword) throw new Error('invalid email or password')
    const tokenGenerator = new TokenGenerator(config.token.signKey)
    const accessToken = tokenGenerator.generateAuthToken(user)
    const { uuid, refreshToken, expiresAt } = tokenGenerator.generateRefreshToken()
    await this.refreshTokenRepository.save({
      uuid,
      userEmail: user.getEmail().getValue(),
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
