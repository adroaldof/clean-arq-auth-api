import { StatusCodes } from 'http-status-codes'

export interface HttpServer {
  on(method: string, url: string, callback: CallbackFunction): void
  listen(port: number): void
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export type CallbackFunction = (params?: any, body?: any, query?: any) => Promise<CallbackOutput>

type CallbackOutput = {
  output?: any
  statusCode?: StatusCodes
  emptyResponse?: boolean
}
/* eslint-enable @typescript-eslint/no-explicit-any */
