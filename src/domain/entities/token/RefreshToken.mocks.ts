import { faker } from '@faker-js/faker'
import { RefreshToken } from './RefreshToken'

export const mockRefreshToken = (overrides: Partial<RefreshToken> = {}): RefreshToken =>
  new RefreshToken(
    overrides.uuid || faker.datatype.uuid(),
    overrides.userUuid || faker.datatype.uuid(),
    overrides.expiresAt || faker.date.future(),
  )
