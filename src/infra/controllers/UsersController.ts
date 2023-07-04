import { HttpServer } from '../http/HttpServer'
import { Request } from 'express'
import { UseCase } from '@/use-cases/UseCase'
import { validateSchemaMiddleware } from '@/http/validate-schema-middleware'
import { z } from 'zod'

export class UsersController {
  constructor(
    readonly httpServer: HttpServer,
    readonly listUsers: UseCase,
    readonly getMe: UseCase,
    readonly userDetail: UseCase,
    readonly updateUser: UseCase,
  ) {
    this.httpServer.on(
      'get',
      '/api/users/me',
      async (req: Request) => {
        const { authorization } = req.headers
        const output = await this.getMe.execute({ authorization })
        return { output }
      },
      validateSchemaMiddleware(authorizedSchema),
    )

    this.httpServer.on(
      'get',
      '/api/users/:userUuid',
      async (req: Request) => {
        const { headers, params } = req
        const { authorization } = headers
        const { userUuid } = params
        const output = await this.userDetail.execute({ authorization, userUuid })
        return { output }
      },
      validateSchemaMiddleware(userDetailSchema),
    )

    this.httpServer.on(
      'put',
      '/api/users/:userUuid',
      async (req: Request) => {
        const { headers, params, body } = req
        const { authorization } = headers
        const { userUuid } = params
        const output = await this.updateUser.execute({ authorization, userUuid, ...body })
        return { output }
      },
      validateSchemaMiddleware(userDetailSchema),
    )

    this.httpServer.on(
      'get',
      '/api/users',
      async (req: Request) => {
        const { authorization } = req.headers
        const output = await this.listUsers.execute({ authorization })
        return { output }
      },
      validateSchemaMiddleware(authorizedSchema),
    )
  }
}

const authorizedSchema = z.object({
  headers: z.object({
    authorization: z.string({ required_error: 'authorization header is required' }),
  }),
})

const userDetailSchema = z.object({
  headers: z.object({
    authorization: z.string({ required_error: 'authorization header is required' }),
  }),
  params: z.object({
    userUuid: z.string({ required_error: 'user uuid is required' }),
  }),
})

const updateUserSchema = z.object({
  headers: z.object({
    authorization: z.string({ required_error: 'authorization header is required' }),
  }),
  params: z.object({
    userUuid: z.string({ required_error: 'user uuid is required' }),
  }),
  body: z.object({
    name: z.string(),
    email: z.string(),
    profilePictureUrl: z.string(),
  }),
})
