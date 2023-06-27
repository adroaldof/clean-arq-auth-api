import { faker } from '@faker-js/faker'
import { ResetPassword } from '@/entities/auth/ResetPassword'
import { ResetPasswordPort } from './ResetPasswordPort'

export const mockResetPasswordRepository = (overrides: Partial<ResetPasswordPort> = {}): ResetPasswordPort => ({
  save: async () => Promise.resolve(faker.datatype.uuid()),
  getByUuid: async (uuid: string = faker.datatype.uuid()) =>
    Promise.resolve(new ResetPassword(uuid, faker.datatype.uuid(), new Date())),
  invalidateByUserUuid: async (uuid: string) => {},
  ...overrides,
})
