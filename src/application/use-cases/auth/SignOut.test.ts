import { expect, it, vi } from 'vitest'
import { faker } from '@faker-js/faker'
import { mockRefreshToken } from '@/entities/token/RefreshToken.mocks'
import { mockRefreshTokenRepository } from '@/ports/RefreshTokenRepository.mocks'
import { SignOut } from './SignOut'

it('throws `refresh token not found` passing an invalid uuid', async () => {
  const refreshTokenRepository = mockRefreshTokenRepository()
  const signOut = new SignOut(refreshTokenRepository)
  const invalidUuid = { uuid: faker.datatype.uuid() }
  expect(() => signOut.execute(invalidUuid)).rejects.toThrow('refresh token not found')
})

it('calls save on auth repository on creating a new user account', async () => {
  const refreshTokenUuid = faker.datatype.uuid()
  const refreshTokenRepository = mockRefreshTokenRepository({
    getByUuid: async () => Promise.resolve(mockRefreshToken({ uuid: refreshTokenUuid })),
  })
  const invalidateRefreshTokenSpy = vi.spyOn(refreshTokenRepository, 'invalidateRefreshToken')
  const signOut = new SignOut(refreshTokenRepository)
  const input = { uuid: refreshTokenUuid }
  await signOut.execute(input)
  expect(invalidateRefreshTokenSpy).toBeCalled()
})
