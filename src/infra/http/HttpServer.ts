import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

export interface HttpServer {
  on(method: string, url: string, callback: CallbackFunction, ...middlewares: any): void
  listen(port: number): void
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export type CallbackFunction = (req: Request) => Promise<CallbackOutput>
export type NextCallbackFunction = (req: Request, res: Response, next: NextFunction) => void

type CallbackOutput = {
  output?: any
  statusCode?: StatusCodes
  emptyResponse?: boolean
}
/* eslint-enable @typescript-eslint/no-explicit-any */
