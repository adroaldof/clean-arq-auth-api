import { pbkdf2, randomBytes } from 'crypto'

const SALT_LENGTH = 32
const ITERATIONS = 100
const KEY_LENGTH = 64
const DIGEST = 'sha512'

// Value Object - Password
export class Password {
  constructor(readonly value: string, readonly salt: string) {}

  static create(password: string, salt?: string): Promise<Password> {
    const generatedSalt = salt || randomBytes(SALT_LENGTH).toString('hex')
    return new Promise((resolve, reject) => {
      pbkdf2(password, generatedSalt, ITERATIONS, KEY_LENGTH, DIGEST, (error, derivedKey) => {
        if (error) return reject(error)
        return resolve(new Password(derivedKey.toString('hex'), generatedSalt))
      })
    })
  }

  validate(password: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      pbkdf2(password, this.salt, ITERATIONS, KEY_LENGTH, DIGEST, (error, derivedKey) => {
        if (error) return reject(error)
        return resolve(derivedKey.toString('hex') === this.value)
      })
    })
  }

  getValue() {
    return this.value
  }

  getSalt() {
    return this.salt
  }
}
