import { VerifyToken } from './VerifyToken';

it('verifies a given access token', async () => {
  const accessToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG4uZG9lQGVtYWlsLmNvbSIsImlhdCI6MTY4MTA0NTIwMDAwMCwiZXhwIjoxOTk2NDA1MjAwMDAwfQ.NSHEzWBPUXM6qvw48k7PpijBx8iv-epyXZneCeIuJm4'
  const verifyToken = new VerifyToken()
  const output = await verifyToken.execute({ accessToken })
  expect(output).toBeTruthy()
})
