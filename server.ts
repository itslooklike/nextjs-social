import dotenv from 'dotenv'
import http from 'http'
import next from 'next'
import express from 'express'
// import connectDb from '~/utilsServer/connectDb'
import signupRouter from '~/api/signup'
import authRouter from '~/api/auth'

dotenv.config()

const app = express()
const server = http.createServer(app)

const dev = process.env.NODE_ENV !== 'production'

const nextApp = next({ dev })
const handle = nextApp.getRequestHandler()

const PORT = process.env.PORT || 3000

// connectDb()

nextApp.prepare().then(() => {
  app.use('/api/signup', signupRouter)
  app.use('/api/login', authRouter)
  app.all('*', (req, res) => handle(req, res))

  server.listen(PORT, () => {
    console.log(`server run on: http://localhost:${PORT}`)
  })
})

// - server - node server
// - app - express server
// - nextApp - next server
