import { expect, it, vi } from 'vitest'
import { faker } from '@faker-js/faker'
import { mockUser } from '@/entities/user/User.mocks'
import { mockUserRepository } from '@/ports/UserRepository.mocks'
import { UpdateUser } from './UpdateUser'

const userUuid = faker.datatype.uuid()

it('throws `user not found` when the user uuid is invalid', async () => {
  const usersRepository = mockUserRepository({ getByUuid: async () => Promise.resolve(null) })
  const updateUser = new UpdateUser(usersRepository)
  expect(() => updateUser.execute({ userUuid })).rejects.toThrow('user not found')
})

it('calls update from user repository', async () => {
  const mockedUser = await mockUser()
  const usersRepository = mockUserRepository({
    getByUuid: async () => Promise.resolve(mockedUser),
  })
  const updateSpy = vi.spyOn(usersRepository, 'update')
  const getMe = new UpdateUser(usersRepository)
  await getMe.execute({ userUuid: mockedUser.uuid })
  expect(updateSpy).toHaveBeenCalledWith(mockedUser)
})
