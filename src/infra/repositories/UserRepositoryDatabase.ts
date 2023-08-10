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
    return Promise.all(databaseOutput.map(fromDatabaseOutputToUser))
  }

  async getByEmail(email: string): Promise<User | null> {
    const databaseOutput = await this.connection.connection(tableNames.users).where({ email }).first()
    return databaseOutput ? fromDatabaseOutputToUser(databaseOutput) : null
  }

  async getByUuid(uuid: string): Promise<User | null> {
    const databaseOutput = await this.connection.connection(tableNames.users).where({ uuid }).first()
    return databaseOutput ? fromDatabaseOutputToUser(databaseOutput) : null
  }

  async updatePassword(uuid: string, password: Password): Promise<void> {
    await this.connection
      .connection(tableNames.users)
      .update({ password: password.getValue(), salt: password.getSalt() })
      .where({ uuid })
  }

  async save(auth: User): Promise<void> {
    await this.connection.connection(tableNames.users).insert(fromUserToDatabaseInput(auth))
  }

  async update(user: User): Promise<void> {
    const { password, salt, ...userDatabaseInput } = fromUserToDatabaseInput(user)
    await this.connection.connection(tableNames.users).update(userDatabaseInput).where({ uuid: user.uuid })
  }

  async delete(uuid: string): Promise<void> {
    await this.connection.connection(tableNames.users).update({ status: 'deleted' }).where({ uuid })
  }
}

interface UserDatabaseInput {
  email: string
  password: string
  salt: string
  name?: string
  profilePictureUrl?: string
}

interface UserDatabaseOutput {
  email: string
  password: string
  salt: string
  name: string
  profilePictureUrl: string
  uuid: string
}

const fromDatabaseOutputToUser = async ({
  email,
  password,
  salt,
  name,
  profilePictureUrl,
  uuid,
}: UserDatabaseOutput): Promise<User> => {
  return User.hydrateUser({ email, password, salt, name, profilePictureUrl, uuid })
}

const fromUserToDatabaseInput = (auth: User): UserDatabaseInput => {
  return {
    email: auth.getEmail().getValue(),
    password: auth.getPassword().getValue(),
    salt: auth.getPassword().getSalt(),
    name: auth.getName(),
    profilePictureUrl: auth.getProfilePictureUrl(),
  }
}
