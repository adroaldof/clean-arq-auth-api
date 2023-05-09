import { Auth } from '@/entities/auth/Auth'
import { AuthRepository } from '@/ports/AuthRepository'

export class SignUp {
  constructor(readonly authRepository: AuthRepository) {}

  async execute(input: SignUpInput): Promise<void> {
    const auth = await Auth.create(input.email, input.password)
    return this.authRepository.save(auth)
  }
}

type SignUpInput = {
  email: string
  password: string
}
