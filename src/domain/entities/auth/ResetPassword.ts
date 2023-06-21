import { randomUUID } from 'crypto'

const EXPIRES_AT = 15 * 60 * 1000 // 15 minutes

export class ResetPassword {
  private status = 'active'

  constructor(
    readonly uuid: string = randomUUID(),
    readonly userUuid: string,
    readonly expiresAt: Date = new Date(new Date().getTime() + EXPIRES_AT),
  ) {}

  verify() {
    return this.status === 'active' && this.expiresAt.getTime() > new Date().getTime()
  }

  getStatus() {
    return this.status
  }

  toJson() {
    return {
      uuid: this.uuid,
      userUuid: this.userUuid,
      expiresAt: this.expiresAt,
      status: this.status,
    }
  }
}
