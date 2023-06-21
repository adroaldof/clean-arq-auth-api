import { Connection } from '@/database/Connection'
import { ResetPassword } from '@/entities/auth/ResetPassword'
import { ResetPasswordPort } from '@/ports/ResetPasswordPort'
import { tableNames } from '@/database/table-names.mjs'

export class ResetPasswordRepositoryDatabase implements ResetPasswordPort {
  constructor(readonly connection: Connection) {}

  async save(input: ResetPassword): Promise<string> {
    const databaseInput = fromResetPasswordToDatabase(input)
    const [output] = await this.connection.connection(tableNames.resetPassword).insert(databaseInput).returning('uuid')
    return output.uuid
  }
}

const fromResetPasswordToDatabase = (input: ResetPassword) => input.toJson()
