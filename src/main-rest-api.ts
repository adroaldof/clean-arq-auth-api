import { config } from './config'
import { ExpressHttpServer } from './infra/http/ExpressHttpServer'
import { RootController } from './infra/controller/RootController'

const httpServer = new ExpressHttpServer()

new RootController(httpServer)

httpServer.listen(config.server.port)
