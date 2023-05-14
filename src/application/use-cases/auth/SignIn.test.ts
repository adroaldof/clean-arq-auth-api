import { Auth } from '@/entities/auth/Auth';
import { mockAuthRepository } from '@/ports/AuthRepository.mocks';
import { SignIn } from './SignIn';

const payload = {
  email: 'john.doe@email.com',
  password: 'abc123',
}

it('returns the access token on authenticate the user', async () => {
  const authRepository = mockAuthRepository({
    get: () => Promise.resolve(Auth.create(payload.email, payload.password)),
  })
  const getAuthSpy = jest.spyOn(authRepository, 'get')
  const signIn = new SignIn(authRepository)
  const output = await signIn.execute(payload)
  expect(getAuthSpy).toBeCalled()
  expect(output).toEqual(
    expect.objectContaining({
      accessToken: expect.any(String),
    }),
  )
})

it('returns `invalid email or password` when the user is not found', async () => {
  const authRepository = mockAuthRepository({ get: () => Promise.resolve(null) })
  const signIn = new SignIn(authRepository)
  expect(() => signIn.execute(payload)).rejects.toThrow(new Error('invalid email or password'))
})
