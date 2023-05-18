import jwt, { Algorithm, JwtPayload, SignOptions } from 'jsonwebtoken'
import { Auth } from './Auth'

const ALGORITHM: Algorithm = 'HS512'
const EXPIRES_IN = 60 * 60 * 3 * 1000 // 3 hours (seconds * minutes * hours * multiplier)

type JwtSignPayload = JwtPayload & {
  email: string
}

// Domain service
export class TokenGenerator {
  constructor(readonly secretOrPrivateKey: string) {}

  generate(user: Auth, issueDate: Date = new Date(), expiresIn: number = EXPIRES_IN) {
    const iat = issueDate.getTime()
    const exp = iat + expiresIn
    const payload: JwtSignPayload = { email: user.email.getValue(), iat, exp }
    const options: SignOptions = { algorithm: ALGORITHM }
    return jwt.sign(payload, this.secretOrPrivateKey, options)
  }

  verify(token: string): JwtPayload {
    return jwt.verify(token, this.secretOrPrivateKey) as JwtPayload
  }
}
