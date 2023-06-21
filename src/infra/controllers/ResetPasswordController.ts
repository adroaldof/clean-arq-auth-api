import { config } from '@/config'
import { GenerateResetPassword } from '@/use-cases/password/GenerateResetPassword'
import { HttpServer } from '../http/HttpServer'
import { StatusCodes } from 'http-status-codes'
import { validateSchemaMiddleware } from '@/http/validate-schema-middleware'
import { z } from 'zod'

export class ResetPasswordController {
  constructor(readonly httpServer: HttpServer, readonly generateResetPassword: GenerateResetPassword) {
    this.httpServer.on(
      'post',
      '/api/password/reset',
      async ({ body }: { body: ResetPasswordInput }) => {
        const output = await this.generateResetPassword.execute(body)
        config.server.env !== 'test' && delete output.token // The token should be sent only to the user email (// FIXME: get back when implement send email feature)
        return { statusCode: StatusCodes.CREATED, output }
      },
      validateSchemaMiddleware(signUpSchema),
    )
  }
}

type ResetPasswordInput = {
  email: string
}

const signUpSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'email is required' }).email('invalid email'),
  }),
})
