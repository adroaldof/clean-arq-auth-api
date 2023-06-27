import { AuthController } from '@/infra/controllers/AuthController'
import { AuthDecorator } from '@/decorators/AuthDecorator'
import { config } from './config'
import { ExpressHttpServer } from './infra/http/ExpressHttpServer'
import { GenerateAuthTokenFromRefreshToken } from '@/use-cases/auth/GenerateTokenFromRefreshToken'
import { GenerateResetPassword } from '@/use-cases/password/GenerateResetPassword'
import { GetMe } from '@/use-cases/users/GetMe'
import { KnexAdapter } from '@/database/KnexAdapter'
import { ListUsers } from '@/use-cases/users/ListUsers'
import { RefreshTokenRepositoryDatabase } from '@/repositories/RefreshTokenRepositoryDatabase'
import { ResetPasswordController } from '@/controllers/ResetPasswordController'
import { ResetPasswordRepositoryDatabase } from '@/repositories/ResetPasswordRepositoryDatabase'
import { RootController } from './infra/controllers/RootController'
import { SignIn } from '@/use-cases/auth/SignIn'
import { SignUp } from '@/use-cases/auth/SignUp'
import { UpdatePassword } from '@/use-cases/password/UpdatePassword'
import { UserRepositoryDatabase } from '@/repositories/UserRepositoryDatabase'
import { UsersController } from '@/controllers/UsersController'
import { VerifyToken } from '@/use-cases/auth/VerifyToken'

const connection = new KnexAdapter()
connection.migrate()

const httpServer = new ExpressHttpServer()

new RootController(httpServer)

const usersRepository = new UserRepositoryDatabase(connection)
const refreshTokenRepository = new RefreshTokenRepositoryDatabase(connection)
const signUp = new SignUp(usersRepository)
const signIn = new SignIn(usersRepository, refreshTokenRepository)
const verifyToken = new VerifyToken()
const generateAuthTokenFromRefreshToken = new GenerateAuthTokenFromRefreshToken(refreshTokenRepository, usersRepository)
new AuthController(httpServer, signUp, signIn, verifyToken, generateAuthTokenFromRefreshToken)

const resetPasswordRepository = new ResetPasswordRepositoryDatabase(connection)
const generateResetPassword = new GenerateResetPassword(usersRepository, resetPasswordRepository)
const updatePassword = new UpdatePassword(resetPasswordRepository, usersRepository)
new ResetPasswordController(httpServer, generateResetPassword, updatePassword)

const getMe = new AuthDecorator(new GetMe(usersRepository))
const listUsers = new AuthDecorator(new ListUsers(usersRepository))
new UsersController(httpServer, getMe, listUsers)

httpServer.listen(config.server.port)
