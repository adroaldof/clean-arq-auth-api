import { Auth } from '@/entities/auth/Auth';

export interface AuthRepository {
  save(auth: Auth): Promise<void>
  get(auth: string): Promise<Auth | null>
}
