import { HttpServer } from '@/http/HttpServer'

export class RootController {
  constructor(readonly httpServer: HttpServer) {
    this.httpServer.on('get', '/api', async () => ({ emptyResponse: true, statusCode: 200 }))
    this.httpServer.on('get', '/api/healthz', async () => ({ emptyResponse: true }))
  }
}
