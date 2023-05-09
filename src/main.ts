import express, { Request, Response } from 'express'

const PORT = process.env.PORT || 5000

const app = express()
app.use(express.json())

app.get('/api', (_req: Request, res: Response) => {
  res.send({ ok: true })
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
})
