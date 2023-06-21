import { ResetPassword } from '@/entities/auth/ResetPassword'

export interface ResetPasswordPort {
  save(input: ResetPassword): Promise<string>
}
