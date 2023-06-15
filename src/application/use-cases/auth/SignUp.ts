import { User } from '@/entities/user/User';
import { UserRepository } from '@/ports/UserRepository';

export class SignUp {
  constructor(readonly usersRepository: UserRepository) {}

  async execute(input: SignUpInput): Promise<void> {
    const auth = await User.create(input.email, input.password, input.name, input.profilePictureUrl)
    return this.usersRepository.save(auth)
  }
}

type SignUpInput = {
  email: string
  password: string
  name?: string
  profilePictureUrl?: string
}
