import { ResetPasswordPort } from './ResetPasswordPort'

export const mockResetPasswordRepository = (overrides: Partial<ResetPasswordPort> = {}): ResetPasswordPort => ({
  save: async () => Promise.resolve(),
  ...overrides,
})
