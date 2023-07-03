import { RefreshToken } from '@/entities/token/RefreshToken'

export interface RefreshTokenRepository {
  save(input: RefreshTokenInput): Promise<string>
  getByUuid(uuid: string): Promise<RefreshToken | null>
  invalidateByUserUuid(userUuid: string): Promise<void>
}

export type RefreshTokenInput = {
  uuid: string
  userUuid: string
  expiresAt: Date
}
