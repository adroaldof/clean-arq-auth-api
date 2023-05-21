import { Auth } from '@/entities/auth/Auth';

export interface RefreshTokenRepository {
  save(input: RefreshTokenInput): Promise<string>
  get(uuid: string): Promise<RefreshTokenRepositoryOutput | null>
}

export type RefreshTokenRepositoryOutput = {
  uuid: string
  userEmail: string
  expiresAt: Date
}

export type RefreshTokenInput = {
  uuid: string
  userEmail: string
  expiresAt: Date
}
