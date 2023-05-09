import cors from 'cors'
import express, { Request, Response } from 'express'
import { CallbackFunction, HttpServer } from './HttpServer'
import { StatusCodes } from 'http-status-codes'

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ExpressHttpServer implements HttpServer {
  server: any

  constructor() {
    this.server = express()
    this.server.use(express.json())
    this.server.use(cors())
  }

  on(method: string, url: string, callback: CallbackFunction): void {
    this.server[method](url, async (req: Request, res: Response) => {
      try {
        const { output, statusCode, emptyResponse = false } = await callback(req.params, req.body, req.query)
        const code = statusCode || StatusCodes.OK
        if (emptyResponse) return res.sendStatus(code)
        return res.status(code).send(output)
      } catch (error: any) {
        return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ message: error.message })
      }
    })
  }

  listen(port: number): void {
    this.server.listen(port, () => console.info(`** Server listening on http://localhost:${port}/api`))
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
