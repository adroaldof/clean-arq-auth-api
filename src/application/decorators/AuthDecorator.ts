import { config } from '@/config'
import { JwtTokenGenerator } from '@/entities/token/JwtTokenGenerator'
import { UseCase } from '@/use-cases/UseCase'

export class AuthDecorator implements UseCase {
  constructor(readonly useCase: UseCase) {}

  async execute(input: any): Promise<any> {
    if (!input.authorization) {
      throw new Error('not authenticated')
    }

    try {
      const [_authorizationPrefix, accessToken] = input.authorization.split(' ')
      const tokenGenerator = new JwtTokenGenerator(config.token.signKey)
      const decodedToken = tokenGenerator.verify(accessToken)
      const authenticatedInput = { ...input.body, userEmail: decodedToken.email }
      return this.useCase.execute(authenticatedInput)
    } catch (error) {
      throw new Error('not authenticated')
    }
  }
}
