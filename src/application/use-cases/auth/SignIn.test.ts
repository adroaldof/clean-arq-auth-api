import { expect, it, vi } from 'vitest'
import { mockRefreshTokenRepository } from '@/ports/RefreshTokenRepository.mocks'
import { mockUser } from '@/entities/user/User.mocks'
import { mockUserRepository } from '@/ports/UserRepository.mocks'
import { SignIn } from './SignIn'
import { User } from '@/entities/user/User'

const payload = {
  email: 'john.doe@email.com',
  password: 'abc123',
}

it("throws `invalid email or password` when the password don't match", async () => {
  const usersRepository = mockUserRepository({
    getByEmail: () => Promise.resolve(mockUser({ email: payload.email, password: payload.password })),
  })
  const refreshTokenRepository = mockRefreshTokenRepository()
  const signIn = new SignIn(usersRepository, refreshTokenRepository)
  const input = { ...payload, password: 'wrong-password' }
  expect(() => signIn.execute(input)).rejects.toThrow(new Error('invalid email or password'))
})

it('throws `invalid email or password` when the user is not found', async () => {
  const usersRepository = mockUserRepository({ getByEmail: () => Promise.resolve(null) })
  const refreshTokenRepository = mockRefreshTokenRepository()
  const signIn = new SignIn(usersRepository, refreshTokenRepository)
  expect(() => signIn.execute(payload)).rejects.toThrow(new Error('invalid email or password'))
})

it('returns the access token and the refresh token on authenticating the user', async () => {
  const usersRepository = mockUserRepository({
    getByEmail: () => Promise.resolve(mockUser({ email: payload.email, password: payload.password })),
  })
  const refreshTokenRepository = mockRefreshTokenRepository()
  const getAuthSpy = vi.spyOn(usersRepository, 'getByEmail')
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
