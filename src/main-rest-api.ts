import { AuthController } from '@/infra/controllers/AuthController'
import { AuthDecorator } from '@/decorators/AuthDecorator'
import { config } from './config'
import { DeleteUser } from '@/use-cases/users/DeleteUser'
import { DetailUser } from '@/use-cases/users/DetailUser'
import { ExpressHttpServer } from './infra/http/ExpressHttpServer'
import { GenerateAuthTokenFromRefreshToken } from '@/use-cases/auth/GenerateAuthTokenFromRefreshToken'
import { GenerateResetPassword } from '@/use-cases/password/GenerateResetPassword'
import { GetMe } from '@/use-cases/users/GetMe'
import { KnexAdapter } from '@/database/KnexAdapter'
import { ListUsers } from '@/use-cases/users/ListUsers'
import { RefreshTokenRepositoryDatabase } from '@/repositories/RefreshTokenRepositoryDatabase'
import { ResetPasswordController } from '@/controllers/ResetPasswordController'
import { ResetPasswordRepositoryDatabase } from '@/repositories/ResetPasswordRepositoryDatabase'
import { RootController } from './infra/controllers/RootController'
import { SignIn } from '@/use-cases/auth/SignIn'
import { SignOut } from '@/use-cases/auth/SignOut'
import { SignUp } from '@/use-cases/auth/SignUp'
import { UpdatePassword } from '@/use-cases/password/UpdatePassword'
import { UpdateUser } from '@/use-cases/users/UpdateUser'
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
const signOut = new AuthDecorator(new SignOut(refreshTokenRepository))
const verifyToken = new VerifyToken()
const generateAuthTokenFromRefreshToken = new GenerateAuthTokenFromRefreshToken(refreshTokenRepository, usersRepository)
new AuthController(httpServer, signUp, signIn, signOut, verifyToken, generateAuthTokenFromRefreshToken)

const resetPasswordRepository = new ResetPasswordRepositoryDatabase(connection)
const generateResetPassword = new GenerateResetPassword(usersRepository, resetPasswordRepository)
const updatePassword = new UpdatePassword(resetPasswordRepository, usersRepository)
new ResetPasswordController(httpServer, generateResetPassword, updatePassword)

const listUsers = new AuthDecorator(new ListUsers(usersRepository))
const getMe = new AuthDecorator(new GetMe(usersRepository))
const detailUser = new AuthDecorator(new DetailUser(usersRepository))
const updateUser = new AuthDecorator(new UpdateUser(usersRepository))
const deleteUser = new AuthDecorator(new DeleteUser(usersRepository))
new UsersController(httpServer, listUsers, getMe, detailUser, updateUser, deleteUser)

httpServer.listen(config.server.port)
