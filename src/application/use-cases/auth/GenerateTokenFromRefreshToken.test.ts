import { config } from '@/config'
import { expect, it, vi } from 'vitest'
import { faker } from '@faker-js/faker'
import { GenerateAuthTokenFromRefreshToken } from './GenerateTokenFromRefreshToken'
import { mockRefreshTokenRepository } from '@/ports/RefreshTokenRepository.mocks'
import { mockUserRepository } from '@/ports/UserRepository.mocks'
import { TokenGenerator } from '@/entities/auth/TokenGenerator'

const user = {
  email: 'john.doe@email.com',
  password: 'abc123',
}

it('returns a new authentication token from a refresh token', async () => {
  const refreshTokenRepository = mockRefreshTokenRepository({
    get: () => Promise.resolve({ uuid: faker.datatype.uuid(), userEmail: user.email, expiresAt: new Date() }),
  })
  const usersRepository = mockUserRepository()
  const getAuthSpy = vi.spyOn(usersRepository, 'get')
  const getRefreshTokenSpy = vi.spyOn(refreshTokenRepository, 'get')
  const generateAuthTokenFromRefreshToken = new GenerateAuthTokenFromRefreshToken(
    refreshTokenRepository,
    usersRepository,
  )
  const tokenGenerator = new TokenGenerator(config.token.signKey)
  const { refreshToken } = tokenGenerator.generateRefreshToken()
  const output = await generateAuthTokenFromRefreshToken.execute({ refreshToken })
  expect(getAuthSpy).toHaveBeenCalledOnce()
  expect(getRefreshTokenSpy).toHaveBeenCalledOnce()
  expect(output).toEqual(
    expect.objectContaining({
      accessToken: expect.any(String),
    }),
  )
})

it('returns `invalid refresh token error` when the refresh token is not found', async () => {
  const refreshTokenRepository = mockRefreshTokenRepository()
  const usersRepository = mockUserRepository()
  const generateAuthTokenFromRefreshToken = new GenerateAuthTokenFromRefreshToken(
    refreshTokenRepository,
    usersRepository,
  )
  const tokenGenerator = new TokenGenerator(config.token.signKey)
  const { refreshToken } = tokenGenerator.generateRefreshToken()
  expect(() => generateAuthTokenFromRefreshToken.execute({ refreshToken })).rejects.toThrow(
    new Error('invalid refresh token'),
  )
})

it('returns `invalid refresh token error` when refresh token user is not found', async () => {
  const refreshTokenRepository = mockRefreshTokenRepository({
    get: () => Promise.resolve({ uuid: faker.datatype.uuid(), userEmail: user.email, expiresAt: new Date() }),
  })
  const usersRepository = mockUserRepository({
    get: () => Promise.resolve(null),
  })
  const generateAuthTokenFromRefreshToken = new GenerateAuthTokenFromRefreshToken(
    refreshTokenRepository,
    usersRepository,
  )
  const tokenGenerator = new TokenGenerator(config.token.signKey)
  const { refreshToken } = tokenGenerator.generateRefreshToken()
  expect(() => generateAuthTokenFromRefreshToken.execute({ refreshToken })).rejects.toThrow(
    new Error('invalid refresh token'),
  )
})
