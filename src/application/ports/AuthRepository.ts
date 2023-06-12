import { Auth } from '@/entities/auth/Auth'

export interface AuthRepository {
  save(auth: Auth): Promise<void>
  get(email: string): Promise<Auth | null>
  list(): Promise<Auth[]>
}
