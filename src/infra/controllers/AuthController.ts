import { HttpServer } from '../http/HttpServer';
import { SignUp } from '../../application/use-cases/auth/SignUp';
import { StatusCodes } from 'http-status-codes';
import { validateSchemaMiddleware } from '@/http/validate-schema-middleware';
import { z } from 'zod';

export class AuthController {
  constructor(readonly httpServer: HttpServer, readonly signUp: SignUp) {
    this.httpServer.on(
      'post',
      '/api/auth/sign-up',
      async (_params: DetailParams, body: AuthInput) => {
        try {
          await this.signUp.execute(body)
        } catch (error: any) {
          // TODO: check a secure way to handle this error
          // Postgres error code for unique constraint violation `https://www.postgresql.org/docs/current/errcodes-appendix.html`
          // if (error && error.code === '23505') { }
        }
        return { statusCode: StatusCodes.ACCEPTED, emptyResponse: true }
      },
      validateSchemaMiddleware(createAuthUserSchema),
    )
  }
}

type DetailParams = undefined

type AuthInput = {
  email: string
  password: string
}

const createAuthUserSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'email is required' }).email('invalid email'),
    password: z
      .string({ required_error: 'password is required' })
      .min(8, 'password must be at least 8 characters long')
      .max(128, 'password must be at most 128 characters long'),
  }),
})
