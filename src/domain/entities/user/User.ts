import { Email } from '../auth/Email'
import { Password } from '../auth/Password'
import { randomUUID } from 'crypto'

// Entity - Aggregate
export class User {
  name?: string
  profilePictureUrl?: string
  uuid: string

  // Protecting email and password
  private constructor(
    readonly email: Email,
    readonly password: Password,
    name?: string,
    profilePictureUrl?: string,
    uuid?: string,
  ) {
    this.name = name
    this.profilePictureUrl = profilePictureUrl
    this.uuid = uuid || randomUUID()
  }

  // Factory method
  static async create(email: string, password: string, name?: string, profilePictureUrl?: string): Promise<User> {
    const emailInstance = new Email(email)
    const derivedPassword = await Password.create(password)
    return new User(emailInstance, derivedPassword, name, profilePictureUrl)
  }

  static async hydrateUser(
    email: string,
    password: string,
    salt: string,
    name?: string,
    profilePictureUrl?: string,
    uuid?: string,
  ): Promise<User> {
    const emailInstance = new Email(email)
    const derivedPassword = new Password(password, salt)
    return new User(emailInstance, derivedPassword, name, profilePictureUrl, uuid)
  }

  async isValidPassword(password: string): Promise<boolean> {
    return this.password.validate(password)
  }

  toJson() {
    return {
      uuid: this.uuid,
      email: this.email.getValue(),
      name: this.name,
      profilePictureUrl: this.profilePictureUrl,
    }
  }

  getEmail() {
    return this.email
  }

  getPassword() {
    return this.password
  }

  getName() {
    return this.name
  }

  getProfilePictureUrl() {
    return this.profilePictureUrl
  }
}

export type UserOutput = {
  email: string
  name?: string
  profilePictureUrl?: string
}
