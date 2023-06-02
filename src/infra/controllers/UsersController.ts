import { config } from '@/config'
import { GetMe } from '@/use-cases/users/GetMe'
import { HttpServer } from '../http/HttpServer'
import { TokenGenerator } from '@/entities/auth/TokenGenerator'
import { validateSchemaMiddleware } from '@/http/validate-schema-middleware'
import { z } from 'zod'

export class UsersController {
  constructor(readonly httpServer: HttpServer, readonly getMe: GetMe) {
    this.httpServer.on(
      'get',
      '/api/users/me',
      async (body: any) => {
        const { headers } = body
        const [_, accessToken] = headers.authorization.split(' ')
        const tokenGenerator = new TokenGenerator(config.token.signKey)
        const decodedToken = tokenGenerator.verify(accessToken)
        const output = await this.getMe.execute({ email: decodedToken.email })
        return { output }
      },
      validateSchemaMiddleware(getMeSchema),
    )
  }
}

const getMeSchema = z.object({
  headers: z.object({
    authorization: z.string({ required_error: 'authorization header is required' }),
  }),
})
