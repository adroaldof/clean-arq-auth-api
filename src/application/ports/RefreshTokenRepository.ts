export interface RefreshTokenRepository {
  save(input: RefreshTokenInput): Promise<string>
  getByUuid(uuid: string): Promise<RefreshTokenRepositoryOutput | null>
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
