import supertest, { SuperTest, Test } from 'supertest'
import { ExpressHttpServer } from '@/http/ExpressHttpServer'
import { RootController } from './RootController'
import { StatusCodes } from 'http-status-codes'
import { describe, it } from 'vitest'

const httpServer = new ExpressHttpServer()
new RootController(httpServer)

const request: SuperTest<Test> = supertest(httpServer.server)

describe('GET /api', () => {
  it('returns `200 OK` as answer', async () => {
    await request.get('/api').expect(StatusCodes.OK)
  })
})

describe('GET /api/healthz', () => {
  it('returns `200 OK` as answer', async () => {
    await request.get('/api/healthz').expect(StatusCodes.OK)
  })
})
