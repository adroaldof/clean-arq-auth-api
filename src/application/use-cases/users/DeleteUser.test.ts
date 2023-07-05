import { DeleteUser } from './DeleteUser'
import { expect, it, vi } from 'vitest'
import { faker } from '@faker-js/faker'
import { mockUser } from '@/entities/user/User.mocks'
import { mockUserRepository } from '@/ports/UserRepository.mocks'

const userUuid = faker.datatype.uuid()

it('throws `user not found` when the user uuid is invalid', async () => {
  const usersRepository = mockUserRepository({ getByUuid: async () => Promise.resolve(null) })
  const getMe = new DeleteUser(usersRepository)
  expect(() => getMe.execute({ userUuid })).rejects.toThrow('user not found')
})

it('calls delete from user repository', async () => {
  const mockedUser = await mockUser()
  const usersRepository = mockUserRepository({
    getByUuid: async () => Promise.resolve(mockedUser),
  })
  const deleteSpy = vi.spyOn(usersRepository, 'delete')
  const getMe = new DeleteUser(usersRepository)
  await getMe.execute({ userUuid })
  expect(deleteSpy).toHaveBeenCalledWith(mockedUser.uuid)
})
