import { config } from '@/config'
import { GenerateResetPassword } from '@/use-cases/password/GenerateResetPassword'
import { HttpServer } from '../http/HttpServer'
import { StatusCodes } from 'http-status-codes'
import { UpdatePassword } from '@/use-cases/password/UpdatePassword'
import { validateSchemaMiddleware } from '@/http/validate-schema-middleware'
import { z } from 'zod'

export class ResetPasswordController {
  constructor(
    readonly httpServer: HttpServer,
    readonly generateResetPassword: GenerateResetPassword,
    readonly updatePassword: UpdatePassword,
  ) {
    this.httpServer.on(
      'post',
      '/api/password/reset',
      async ({ body }: { body: ResetPasswordInput }) => {
        const output = await this.generateResetPassword.execute(body)
        config.server.env !== 'test' && delete output.token // The token should be sent only to the user email (// FIXME: get back when implement send email feature)
        return { statusCode: StatusCodes.CREATED, output }
      },
      validateSchemaMiddleware(resetPasswordSchema),
    )

    this.httpServer.on(
      'put',
      '/api/password',
      async ({ body }: { body: UpdatePasswordInput }) => {
        await this.updatePassword.execute(body)
        return { statusCode: StatusCodes.OK, emptyResponse: true }
      },
      validateSchemaMiddleware(updatePasswordSchema),
    )
  }
}

type ResetPasswordInput = {
  email: string
}

const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'email is required' }).email('invalid email'),
  }),
})

type UpdatePasswordInput = {
  token: string
  password: string
  confirmPassword: string
}

const updatePasswordSchema = z.object({
  body: z.object({
    token: z.string({ required_error: 'token is required' }),
    password: z.string({ required_error: 'password is required' }),
    confirmPassword: z.string({ required_error: 'confirmPassword is required' }),
  }),
})
