import { config } from '@/config'
import { JwtPayload } from 'jsonwebtoken'
import { JwtTokenGenerator } from '@/entities/token/JwtTokenGenerator'

export class VerifyToken {
  async execute(input: VerifyTokenInput): Promise<JwtPayload | string> {
    const tokenGenerator = new JwtTokenGenerator({ secretOrPrivateKey: config.token.signKey })
    return tokenGenerator.verify(input.accessToken)
  }
}

type VerifyTokenInput = {
  accessToken: string
}
