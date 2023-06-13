import { User } from '@/entities/auth/User'

export interface UserRepository {
  save(auth: User): Promise<void>
  get(email: string): Promise<User | null>
  list(): Promise<User[]>
}
