import { GenerateAuthTokenFromRefreshToken } from '@/use-cases/auth/GenerateAuthTokenFromRefreshToken'
import { HttpServer } from '../http/HttpServer'
import { SignIn } from '@/use-cases/auth/SignIn'
import { SignUp } from '../../application/use-cases/auth/SignUp'
import { StatusCodes } from 'http-status-codes'
import { validateSchemaMiddleware } from '@/http/validate-schema-middleware'
import { VerifyToken } from '@/use-cases/auth/VerifyToken'
import { z } from 'zod'

export class AuthController {
  constructor(
    readonly httpServer: HttpServer,
    readonly signUp: SignUp,
    readonly signIn: SignIn,
    readonly verifyToken: VerifyToken,
    readonly generateAuthTokenFromRefreshToken: GenerateAuthTokenFromRefreshToken,
  ) {
    this.httpServer.on(
      'post',
      '/api/auth/sign-up',
      async ({ body }: { body: SignUpInput }) => {
        try {
          await this.signUp.execute(body)
        } catch (error: any) {
          // TODO: check a secure way to handle this error
          // Postgres error code for unique constraint violation `https://www.postgresql.org/docs/current/errcodes-appendix.html`
          // if (error && error.code === '23505') { }
        }
        return { statusCode: StatusCodes.ACCEPTED, emptyResponse: true }
      },
      validateSchemaMiddleware(signUpSchema),
    )

    this.httpServer.on(
      'post',
      '/api/auth/sign-in',
      async ({ body }: { body: SignUpInput }) => {
        const output = await this.signIn.execute(body)
        return { output }
      },
      validateSchemaMiddleware(signUpSchema),
    )

    this.httpServer.on(
      'post',
      '/api/auth/verify',
      async ({ body }: { body: VerifyTokenInput }) => {
        const output = await this.verifyToken.execute(body)
        return { output }
      },
      validateSchemaMiddleware(tokenSchema),
    )

    this.httpServer.on(
      'post',
      '/api/auth/refresh',
      async ({ body }: { body: RefreshTokenInput }) => {
        const output = await this.generateAuthTokenFromRefreshToken.execute(body)
        return { output, statusCode: StatusCodes.CREATED }
      },
      validateSchemaMiddleware(refreshTokenSchema),
    )
  }
}

type SignUpInput = {
  email: string
  password: string
  name?: string
  profilePictureUrl?: string
}

type VerifyTokenInput = {
  accessToken: string
}

type RefreshTokenInput = {
  refreshToken: string
}

const signUpSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'email is required' }).email('invalid email'),
    password: z
      .string({ required_error: 'password is required' })
      .min(8, 'password must be at least 8 characters long')
      .max(128, 'password must be at most 128 characters long'),
    name: z
      .string()
      .min(2, 'name must be at least 2 characters long')
      .max(256, 'name must be at most 256 characters long')
      .nullable()
      .optional(),
    profilePictureUrl: z
      .string()
      .min(2, 'name must be at least 2 characters long')
      .max(256, 'name must be at most 256 characters long')
      .nullable()
      .optional(),
  }),
})

const tokenSchema = z.object({
  body: z.object({
    accessToken: z.string({ required_error: 'access token is required' }),
  }),
})

const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string({ required_error: 'refresh token is required' }),
  }),
})
