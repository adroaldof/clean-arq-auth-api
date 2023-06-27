import { beforeEach, expect, it } from 'vitest'
import { faker } from '@faker-js/faker'
import { ResetPassword } from './ResetPassword'

let userUuid: string

beforeEach(() => {
  userUuid = faker.datatype.uuid()
})

it('generates reset password with user id and expires at properties', () => {
  const passwordReset = new ResetPassword(undefined, userUuid)
  expect(passwordReset.toJson()).toEqual(
    expect.objectContaining({
      uuid: expect.any(String),
      userUuid: expect.any(String),
      expiresAt: expect.any(Date),
      status: expect.any(String),
    }),
  )
})

it('generates a reset password with 15 minutes expired at', () => {
  const passwordReset = new ResetPassword(undefined, userUuid)
  const { expiresAt } = passwordReset.toJson()
  const fifteenMinutes = 15 * 60 * 1000
  const expectedExpiresAt = new Date(new Date().getTime() + fifteenMinutes)
  expect(expiresAt.getMinutes()).toBe(expectedExpiresAt.getMinutes())
})

it('returns true when expires date is after current timestamp', () => {
  const passwordReset = new ResetPassword(undefined, userUuid)
  expect(passwordReset.verify()).toBeTruthy()
})

it('returns false when expires date is after current timestamp', () => {
  const fifteenMinutes = 15 * 60 * 1000
  const nowMinusFifteenMinutes = new Date(new Date().getTime() - fifteenMinutes)
  const passwordReset = new ResetPassword(undefined, userUuid, nowMinusFifteenMinutes)
  expect(passwordReset.verify()).toBeFalsy()
})
