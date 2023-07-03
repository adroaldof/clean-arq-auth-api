import { Connection } from '@/database/Connection'
import { Password } from '@/entities/auth/Password'
import { tableNames } from '@/database/table-names.mjs'
import { User } from '@/entities/user/User'
import { UserRepository } from '@/ports/UserRepository'

export class UserRepositoryDatabase implements UserRepository {
  constructor(readonly connection: Connection) {}

  async list(): Promise<User[]> {
    const databaseOutput = await this.connection.connection(tableNames.users)
    if (!databaseOutput.length) return []
    return Promise.all(databaseOutput.map(fromDatabaseOutputToAuth))
  }

  async getByEmail(email: string): Promise<User> {
    const [databaseOutput] = await this.connection.connection(tableNames.users).where({ email })
    if (!databaseOutput) throw new Error('invalid email or password')
    return fromDatabaseOutputToAuth(databaseOutput)
  }

  async getByUuid(uuid: string): Promise<User> {
    const [databaseOutput] = await this.connection.connection(tableNames.users).where({ uuid })
    if (!databaseOutput) throw new Error('invalid email or password')
    return fromDatabaseOutputToAuth(databaseOutput)
  }

  async updatePassword(uuid: string, password: Password): Promise<void> {
    await this.connection
      .connection(tableNames.users)
      .update({ password: password.getValue(), salt: password.getSalt() })
      .where({ uuid })
  }

  async save(auth: User): Promise<void> {
    await this.connection.connection(tableNames.users).insert(fromAuthToDatabaseInput(auth))
  }
}

const fromDatabaseOutputToAuth = async (databaseOutput: any): Promise<User> => {
  return User.hydrateUser(
    databaseOutput.email,
    databaseOutput.password,
    databaseOutput.salt,
    databaseOutput.name,
    databaseOutput.profilePictureUrl,
    databaseOutput.uuid,
  )
}

const fromAuthToDatabaseInput = (auth: User): any => {
  return {
    email: auth.getEmail().getValue(),
    password: auth.getPassword().getValue(),
    salt: auth.getPassword().getSalt(),
    name: auth.getName(),
    profilePictureUrl: auth.getProfilePictureUrl(),
  }
}
