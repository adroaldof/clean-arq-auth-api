import { Connection } from '@/database/Connection'
import { RefreshToken } from '@/entities/token/RefreshToken'
import { RefreshTokenInput, RefreshTokenRepository } from '@/ports/RefreshTokenRepository'
import { tableNames } from '@/database/table-names.mjs'

export class RefreshTokenRepositoryDatabase implements RefreshTokenRepository {
  constructor(readonly connection: Connection) {}

  async save(input: RefreshTokenInput): Promise<string> {
    return this.connection
      .connection(tableNames.refreshToken)
      .insert(fromRefreshTokenRepositoryInputToDatabaseInput(input))
      .returning('uuid')
  }

  async getByUuid(uuid: string): Promise<RefreshToken | null> {
    const databaseOutput = await this.connection.connection(tableNames.refreshToken).where({ uuid }).first()
    if (!databaseOutput) return null
    return fromDatabaseOutputToRefreshToken(databaseOutput)
  }
}

type RefreshTokenDatabase = {
  id?: number
  uuid: string
  userEmail: string
  expiresAt: Date
  status?: string
  createdAt?: Date
  updatedAt?: Date
}

const fromRefreshTokenRepositoryInputToDatabaseInput = (input: RefreshTokenInput): RefreshTokenDatabase => ({
  uuid: input.uuid,
  userEmail: input.userEmail,
  expiresAt: input.expiresAt,
})

const fromDatabaseOutputToRefreshToken = (output: RefreshTokenDatabase): RefreshToken =>
  new RefreshToken(output.uuid, output.userEmail, output.expiresAt)
