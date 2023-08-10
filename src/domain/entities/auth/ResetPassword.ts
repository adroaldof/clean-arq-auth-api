import { randomUUID } from 'crypto'

const EXPIRES_AT = 15 * 60 * 1000 // 15 minutes

interface ResetPasswordInput {
  uuid?: string
  userUuid: string
  expiresAt?: Date
  status?: string
}

export class ResetPassword {
  private status
  uuid: string
  userUuid: string
  expiresAt: Date

  constructor({ uuid, userUuid, expiresAt, status }: ResetPasswordInput) {
    this.uuid = uuid || randomUUID()
    this.userUuid = userUuid
    this.expiresAt = expiresAt || new Date(new Date().getTime() + EXPIRES_AT)
    this.status = status || 'active'
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
