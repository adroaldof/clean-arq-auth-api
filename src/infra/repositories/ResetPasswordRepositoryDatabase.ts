import { Connection } from '@/database/Connection'
import { ResetPassword } from '@/entities/auth/ResetPassword'
import { ResetPasswordPort } from '@/ports/ResetPasswordPort'
import { tableNames } from '@/database/table-names.mjs'

export class ResetPasswordRepositoryDatabase implements ResetPasswordPort {
  constructor(readonly connection: Connection) {}

  async save(input: ResetPassword): Promise<string> {
    const databaseInput = fromResetPasswordToDatabaseInput(input)
    const [output] = await this.connection.connection(tableNames.resetPassword).insert(databaseInput).returning('uuid')
    return output.uuid
  }

  async getByUuid(uuid: string): Promise<ResetPassword | null> {
    const [databaseOutput] = await this.connection.connection(tableNames.resetPassword).where({ uuid })
    return Boolean(databaseOutput) ? fromDatabaseOutputToResetPassword(databaseOutput) : null
  }

  async invalidateByUserUuid(userUuid: string): Promise<void> {
    await this.connection.connection(tableNames.resetPassword).where({ userUuid }).update({ status: 'deleted' })
  }
}

interface ResetPasswordDatabaseInput {
  uuid: string
  userUuid: string
  expiresAt: Date
  status: string
}

interface ResetPasswordDatabaseOutput {
  uuid: string
  userUuid: string
  expiresAt: Date
  status: string
}

const fromResetPasswordToDatabaseInput = (input: ResetPassword): ResetPasswordDatabaseInput => input.toJson()

const fromDatabaseOutputToResetPassword = ({
  uuid,
  userUuid,
  expiresAt,
  status,
}: ResetPasswordDatabaseOutput): ResetPassword => new ResetPassword({ uuid, userUuid, expiresAt, status })
