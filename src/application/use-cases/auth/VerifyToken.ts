import { config } from '@/config';
import { JwtPayload } from 'jsonwebtoken';
import { TokenGenerator } from '@/entities/token/TokenGenerator';

export class VerifyToken {
  async execute(input: VerifyTokenInput): Promise<JwtPayload | string> {
    const tokenGenerator = new TokenGenerator(config.token.signKey)
    return tokenGenerator.verify(input.accessToken)
  }
}

type VerifyTokenInput = {
  accessToken: string
}
