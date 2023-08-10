export class RefreshToken {
  uuid: string
  userUuid: string
  expiresAt: Date

  constructor({ uuid, userUuid, expiresAt }: { uuid: string; userUuid: string; expiresAt: Date }) {
    this.uuid = uuid
    this.userUuid = userUuid
    this.expiresAt = expiresAt
  }
}
