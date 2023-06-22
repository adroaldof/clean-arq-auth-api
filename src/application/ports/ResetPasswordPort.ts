import { ResetPassword } from '@/entities/auth/ResetPassword'

export interface ResetPasswordPort {
  save(input: ResetPassword): Promise<string>
  getByUuid(uuid: string): Promise<ResetPassword | null>
  invalidateByUserUuid(userUuid: string): Promise<void>
}
