import { AuthController } from '@/infra/controllers/AuthController'
import { AuthRepositoryDatabase } from '@/infra/repositories/AuthRepositoryDatabase'
import { config } from './config'
import { ExpressHttpServer } from './infra/http/ExpressHttpServer'
import { KnexAdapter } from '@/database/KnexAdapter'
import { RootController } from './infra/controllers/RootController'
import { SignIn } from '@/use-cases/auth/SignIn'
import { SignUp } from '@/use-cases/auth/SignUp'

const connection = new KnexAdapter()
connection.migrate()

const httpServer = new ExpressHttpServer()

new RootController(httpServer)

const authRepository = new AuthRepositoryDatabase(connection)
const signUp = new SignUp(authRepository)
const signIn = new SignIn(authRepository)
new AuthController(httpServer, signUp, signIn)

httpServer.listen(config.server.port)
