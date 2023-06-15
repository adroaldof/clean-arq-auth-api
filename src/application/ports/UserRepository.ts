import { User } from '@/entities/user/User';

export interface UserRepository {
  save(auth: User): Promise<void>
  get(email: string): Promise<User | null>
  list(): Promise<User[]>
}
