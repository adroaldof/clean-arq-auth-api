import { HttpServer } from '../http/HttpServer'
import { Request } from 'express'
import { UseCase } from '@/use-cases/UseCase'
import { validateSchemaMiddleware } from '@/http/validate-schema-middleware'
import { z } from 'zod'

export class UsersController {
  constructor(readonly httpServer: HttpServer, readonly getMe: UseCase) {
    this.httpServer.on(
      'get',
      '/api/users/me',
      async (req: Request) => {
        const { authorization } = req.headers
        const output = await this.getMe.execute({ authorization })
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
