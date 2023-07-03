export class RefreshToken {
  constructor(readonly uuid: string, readonly userUuid: string, readonly expiresAt: Date) {}
}
