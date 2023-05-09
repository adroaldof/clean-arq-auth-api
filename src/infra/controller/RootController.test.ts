import supertest, { SuperTest, Test } from 'supertest'
import { describe, test } from 'vitest'
import { ExpressHttpServer } from '@/http/ExpressHttpServer'
import { RootController } from './RootController'
import { StatusCodes } from 'http-status-codes'

const httpServer = new ExpressHttpServer()
new RootController(httpServer)

const request: SuperTest<Test> = supertest(httpServer.server)

describe('GET /api', () => {
  test('returns `200 OK` as answer', async () => {
    await request.get('/api').expect(StatusCodes.OK)
  })
})

describe('GET /api/healthz', () => {
  test('returns `200 OK` as answer', async () => {
    await request.get('/api/healthz').expect(StatusCodes.OK)
  })
})
