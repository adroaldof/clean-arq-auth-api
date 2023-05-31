import { Auth } from '@/entities/auth/Auth'
import { AuthRepository } from '@/ports/AuthRepository'
import { Connection } from '@/database/Connection'
import { tableNames } from '@/database/table-names.mjs'

export class AuthRepositoryDatabase implements AuthRepository {
  constructor(readonly connection: Connection) {}

  async get(email: string): Promise<Auth> {
    const [databaseOutput] = await this.connection.connection(tableNames.auth).where({ email })
    if (!databaseOutput) throw new Error('invalid email or password')
    return fromDatabaseOutputToAuth(databaseOutput)
  }

  async save(auth: Auth): Promise<void> {
    await this.connection.connection(tableNames.auth).insert(fromAuthToDatabaseInput(auth))
  }
}

const fromDatabaseOutputToAuth = async (databaseOutput: any): Promise<Auth> => {
  return Auth.buildExistingAuthUser(databaseOutput.email, databaseOutput.password, databaseOutput.salt)
}

const fromAuthToDatabaseInput = (auth: Auth): any => {
  return {
    email: auth.getEmail().getValue(),
    password: auth.getPassword().getValue(),
    salt: auth.getPassword().getSalt(),
    name: auth.getName(),
    profilePictureUrl: auth.getProfilePictureUrl(),
  }
}
