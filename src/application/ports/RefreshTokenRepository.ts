import { RefreshToken } from '@/entities/token/RefreshToken'

export interface RefreshTokenRepository {
  save(input: RefreshTokenInput): Promise<string>
  getByUuid(uuid: string): Promise<RefreshToken | null>
}
}

export type RefreshTokenInput = {
  uuid: string
  userEmail: string
  expiresAt: Date
}
