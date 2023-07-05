import { Password } from '@/entities/auth/Password'
import { User } from '@/entities/user/User'

export interface UserRepository {
  list(): Promise<User[]>
  getByEmail(email: string): Promise<User | null>
  getByUuid(uuid: string): Promise<User | null>
  updatePassword(uuid: string, password: Password): Promise<void>
  save(auth: User): Promise<void>
  update(user: User): Promise<void>
  delete(uuid: string): Promise<void>
}
