import { JwtPayload } from 'jsonwebtoken'
import { TokenGenerator } from '@/entities/auth/TokenGenerator'

export class VerifyToken {
  async execute(input: VerifyTokenInput): Promise<JwtPayload | string> {
    const tokenGenerator = new TokenGenerator('key')
    return tokenGenerator.verify(input.accessToken)
  }
}

type VerifyTokenInput = {
  accessToken: string
}
