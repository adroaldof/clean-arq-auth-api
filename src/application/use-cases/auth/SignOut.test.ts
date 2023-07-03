import { expect, it, vi } from 'vitest'
import { faker } from '@faker-js/faker'
import { mockRefreshTokenRepository } from '@/ports/RefreshTokenRepository.mocks'
import { SignOut } from './SignOut'

it('calls save on auth repository on creating a new user account', async () => {
  const refreshTokenRepository = mockRefreshTokenRepository()
  const invalidateRefreshTokenSpy = vi.spyOn(refreshTokenRepository, 'invalidateByUserUuid')
  const signOut = new SignOut(refreshTokenRepository)
  const input = { userUuid: faker.datatype.uuid() }
  await signOut.execute(input)
  expect(invalidateRefreshTokenSpy).toBeCalled()
})
