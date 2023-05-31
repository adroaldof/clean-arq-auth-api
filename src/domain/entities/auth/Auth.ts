import { Email } from './Email'
import { Password } from './Password'

// Entity - Aggregate
export class Auth {
  name?: string
  profilePictureUrl?: string

  // Protecting email and password
  private constructor(readonly email: Email, readonly password: Password, name?: string, profilePictureUrl?: string) {
    this.name = name
    this.profilePictureUrl = profilePictureUrl
  }

  // Factory method
  static async create(email: string, password: string, name?: string, profilePictureUrl?: string): Promise<Auth> {
    const emailInstance = new Email(email)
    const derivedPassword = await Password.create(password)
    return new Auth(emailInstance, derivedPassword, name, profilePictureUrl)
  }

  static async buildExistingAuthUser(
    email: string,
    password: string,
    salt: string,
    name?: string,
    profilePictureUrl?: string,
  ): Promise<Auth> {
    const emailInstance = new Email(email)
    const derivedPassword = new Password(password, salt)
    return new Auth(emailInstance, derivedPassword, name, profilePictureUrl)
  }

  async isValidPassword(password: string): Promise<boolean> {
    return this.password.validate(password)
  }

  toString() {
    return {
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

export type AuthOutput = {
  email: string
  name?: string
  profilePictureUrl?: string
}
