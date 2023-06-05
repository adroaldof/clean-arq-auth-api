import { config } from '@/config';
import { TokenGenerator } from '@/entities/auth/TokenGenerator';
import { UseCase } from '@/use-cases/UseCase';

export class AuthDecorator implements UseCase {
  constructor(readonly useCase: UseCase) {}

  async execute(input: any): Promise<any> {
    if (!input.authorization) {
      throw new Error('not authenticated')
    }

    try {
      const [_authorizationPrefix, accessToken] = input.authorization.split(' ')
      const tokenGenerator = new TokenGenerator(config.token.signKey)
      const decodedToken = tokenGenerator.verify(accessToken)
      const authenticatedInput = { ...input.body, userEmail: decodedToken.email }
      return this.useCase.execute(authenticatedInput)
    } catch (error) {
      throw new Error('not authenticated')
    }
  }
}
