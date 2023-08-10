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

  invalidateByUserUuid(userUuid: string): Promise<void> {
    return this.connection.connection(tableNames.refreshToken).where({ userUuid }).update({ status: 'deleted' })
  }
}

type RefreshTokenDatabaseInput = {
  id?: number
  uuid: string
  userUuid: string
  expiresAt: Date
  status?: string
  createdAt?: Date
  updatedAt?: Date
}

type RefreshTokenDatabaseOutput = {
  id?: number
  uuid: string
  userUuid: string
  expiresAt: Date
  status?: string
  createdAt?: Date
  updatedAt?: Date
}

const fromRefreshTokenRepositoryInputToDatabaseInput = (input: RefreshTokenInput): RefreshTokenDatabaseInput => ({
  uuid: input.uuid,
  userUuid: input.userUuid,
  expiresAt: input.expiresAt,
})

const fromDatabaseOutputToRefreshToken = ({ uuid, userUuid, expiresAt }: RefreshTokenDatabaseOutput): RefreshToken =>
  new RefreshToken({ uuid, userUuid, expiresAt })
