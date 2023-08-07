import { randomUUID } from 'crypto'

const EXPIRES_AT = 15 * 60 * 1000 // 15 minutes

export class ResetPassword {
  private status = 'active'
  uuid: string
  userUuid: string
  expiresAt: Date

  constructor({ uuid, userUuid, expiresAt }: { uuid?: string; userUuid: string; expiresAt?: Date }) {
    this.uuid = uuid || randomUUID()
    this.userUuid = userUuid
    this.expiresAt = expiresAt || new Date(new Date().getTime() + EXPIRES_AT)
  }

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
