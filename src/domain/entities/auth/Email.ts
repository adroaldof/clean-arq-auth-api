// Value Object - Email
export class Email {
  private value: string

  constructor({ email }: { email: string }) {
    if (!this.isValid(email)) throw new Error('invalid email')
    this.value = email
  }

  isValid(email: string) {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      )
  }

  getValue() {
    return this.value
  }
}
