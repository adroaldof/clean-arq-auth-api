import jwt, { Algorithm, JwtPayload, SignOptions } from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { User } from '../user/User';

const ALGORITHM: Algorithm = 'HS512'
const EXPIRES_IN = 15 * 1000 // 15 seconds
const REFRESH_TOKEN_EXPIRES_IN = 60 * 60 * 24 * 10 * 1000 // 10 days (seconds * minutes * hours * days * multiplier)

type Token = JwtPayload & {
  email: string
}

type RefreshToken = JwtPayload & {
  refreshTokenUuid: string
}

const options: SignOptions = { algorithm: ALGORITHM }

// Domain service
export class TokenGenerator {
  constructor(readonly secretOrPrivateKey: string) {}

  generateAuthToken(user: User, issueDate: Date = new Date(), expiresIn: number = EXPIRES_IN): string {
    const iat = issueDate.getTime()
    const exp = iat + expiresIn
    const payload: Token = { email: user.email.getValue(), iat, exp }
    return jwt.sign(payload, this.secretOrPrivateKey, options)
  }

  generateRefreshToken(expiresIn: number = REFRESH_TOKEN_EXPIRES_IN): {
    uuid: string
    refreshToken: string
    expiresAt: number
  } {
    const uuid = randomUUID()
    const iat = new Date().getTime()
    const exp = iat + expiresIn
    const payload: RefreshToken = { refreshTokenUuid: uuid, iat, exp }
    const refreshToken = jwt.sign(payload, this.secretOrPrivateKey, options)
    return { uuid, refreshToken, expiresAt: exp }
  }

  verify(token: string): JwtPayload {
    return jwt.verify(token, this.secretOrPrivateKey) as JwtPayload
  }
}
