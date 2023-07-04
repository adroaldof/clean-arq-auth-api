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
      const { authorization, ...rest } = input
      const [_authorizationPrefix, accessToken] = authorization.split(' ')
      const tokenGenerator = new JwtTokenGenerator(config.token.signKey)
      const decodedToken = tokenGenerator.verify(accessToken)
      const authenticatedInput = { ...rest, authenticatedUserUuid: decodedToken.uuid }
      return this.useCase.execute(authenticatedInput)
    } catch (error) {
      throw new Error('not authenticated')
    }
  }
}
