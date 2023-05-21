import { AuthController } from '@/infra/controllers/AuthController';
import { AuthRepositoryDatabase } from '@/infra/repositories/AuthRepositoryDatabase';
import { config } from './config';
import { ExpressHttpServer } from './infra/http/ExpressHttpServer';
import { GenerateAuthTokenFromRefreshToken } from '@/use-cases/auth/GenerateTokenFromRefreshToken';
import { KnexAdapter } from '@/database/KnexAdapter';
import { RefreshTokenRepositoryDatabase } from '@/repositories/RefreshTokenRepositoryDatabase';
import { RootController } from './infra/controllers/RootController';
import { SignIn } from '@/use-cases/auth/SignIn';
import { SignUp } from '@/use-cases/auth/SignUp';
import { VerifyToken } from '@/use-cases/auth/VerifyToken';

const connection = new KnexAdapter()
connection.migrate()

const httpServer = new ExpressHttpServer()

new RootController(httpServer)

const authRepository = new AuthRepositoryDatabase(connection)
const refreshTokenRepository = new RefreshTokenRepositoryDatabase(connection)
const signUp = new SignUp(authRepository)
const signIn = new SignIn(authRepository, refreshTokenRepository)
const verifyToken = new VerifyToken()
const generateAuthTokenFromRefreshToken = new GenerateAuthTokenFromRefreshToken(refreshTokenRepository, authRepository)
new AuthController(httpServer, signUp, signIn, verifyToken, generateAuthTokenFromRefreshToken)

httpServer.listen(config.server.port)
