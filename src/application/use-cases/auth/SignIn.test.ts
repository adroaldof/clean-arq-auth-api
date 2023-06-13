import { expect, it, vi } from 'vitest'
import { mockRefreshTokenRepository } from '@/ports/RefreshTokenRepository.mocks'
import { mockUserRepository } from '@/ports/UserRepository.mocks'
import { SignIn } from './SignIn'
import { User } from '@/entities/auth/User'

const payload = {
  email: 'john.doe@email.com',
  password: 'abc123',
}

it('returns the access token and the refresh token on authenticating the user', async () => {
  const usersRepository = mockUserRepository({
    get: () => Promise.resolve(User.create(payload.email, payload.password)),
  })
  const refreshTokenRepository = mockRefreshTokenRepository()
  const getAuthSpy = vi.spyOn(usersRepository, 'get')
  const refreshTokenSpy = vi.spyOn(refreshTokenRepository, 'save')
  const signIn = new SignIn(usersRepository, refreshTokenRepository)
  const output = await signIn.execute(payload)
  expect(getAuthSpy).toBeCalled()
  expect(refreshTokenSpy).toBeCalled()
  expect(output).toEqual(
    expect.objectContaining({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    }),
  )
})

it('returns `invalid email or password` when the user is not found', async () => {
  const usersRepository = mockUserRepository({ get: () => Promise.resolve(null) })
  const refreshTokenRepository = mockRefreshTokenRepository()
  const signIn = new SignIn(usersRepository, refreshTokenRepository)
  expect(() => signIn.execute(payload)).rejects.toThrow(new Error('invalid email or password'))
})
