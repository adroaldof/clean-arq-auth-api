import { Email } from './Email'
import { Password } from './Password'

// Entity - Aggregate
export class Auth {
  // Protecting email and password
  private constructor(readonly email: Email, readonly password: Password) {}

  // Factory method
  static async create(email: string, password: string): Promise<Auth> {
    const emailInstance = new Email(email)
    const derivedPassword = await Password.create(password)
    return new Auth(emailInstance, derivedPassword)
  }

  static async buildExistingAuthUser(email: string, password: string, salt: string): Promise<Auth> {
    const emailInstance = new Email(email)
    const derivedPassword = new Password(password, salt)
    return new Auth(emailInstance, derivedPassword)
  }

  getEmail() {
    return this.email
  }

  getPassword() {
    return this.password
  }

  async isValidPassword(password: string): Promise<boolean> {
    return this.password.validate(password)
  }
}
