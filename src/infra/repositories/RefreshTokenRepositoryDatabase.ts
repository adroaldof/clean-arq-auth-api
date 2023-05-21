import { Connection } from '@/database/Connection'
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

  async get(uuid: string): Promise<RefreshTokenInput | null> {
    const databaseOutput = await this.connection.connection(tableNames.refreshToken).where({ uuid }).first()
    if (!databaseOutput) return null
    return fromDatabaseOutputToRefreshTokenRepositoryOutput(databaseOutput)
  }
}

type RefreshTokenDatabaseInput = {
  uuid: string
  userEmail: string
  expiresAt: Date
}

const fromRefreshTokenRepositoryInputToDatabaseInput = (input: RefreshTokenInput): RefreshTokenDatabaseInput => ({
  uuid: input.uuid,
  userEmail: input.userEmail,
  expiresAt: input.expiresAt,
})

const fromDatabaseOutputToRefreshTokenRepositoryOutput = (output: RefreshTokenDatabaseInput): RefreshTokenInput => ({
  uuid: output.uuid,
  userEmail: output.userEmail,
  expiresAt: output.expiresAt,
})
