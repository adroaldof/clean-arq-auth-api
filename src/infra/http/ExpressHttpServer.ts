import cors from 'cors'
import express, { Request, Response } from 'express'
import { CallbackFunction, HttpServer, NextCallbackFunction } from './HttpServer'
import { httpLogger } from '@/logger/morgan'
import { logger } from '@/logger/winston'
import { StatusCodes } from 'http-status-codes'

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ExpressHttpServer implements HttpServer {
  server: any

  constructor() {
    this.server = express()
    this.server.use(express.json())
    this.server.use(cors())
    this.server.use(httpLogger)
  }

  on(method: string, url: string, callback: CallbackFunction, ...middlewares: NextCallbackFunction[]): void {
    const responseHandler = async (req: Request, res: Response) => {
      try {
        const { output, statusCode, emptyResponse = false } = await callback(req)
        const code = statusCode || StatusCodes.OK
        if (emptyResponse) return res.sendStatus(code)
        return res.status(code).send(output)
      } catch (error: any) {
        return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ message: error.message })
      }
    }

    if (middlewares?.length) {
      return this.server[method](url, ...middlewares, responseHandler)
    }

    this.server[method](url, responseHandler)
  }

  /* c8 ignore start */
  listen(port: number): void {
    this.server.listen(port, () => logger.info(`Server listening on http://localhost:${port}/api`))
  }
  /* c8 ignore stop */
}
/* eslint-enable @typescript-eslint/no-explicit-any */
