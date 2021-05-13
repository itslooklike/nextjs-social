require('dotenv').config()

const app = require('express')()
const server = require('http').Server(app)
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const handle = nextApp.getRequestHandler()

const connectDb = require('./src/utilsServer/connectDb')

const PORT = process.env.PORT || 3000

// connectDb()

nextApp.prepare().then(() => {
  app.all('*', (req, res) => handle(req, res))

  server.listen(PORT, (err) => {
    if (err) {
      throw err
    }

    console.log(`server run on: http://localhost:${PORT}`)
  })
})

// - app
// - server
// - nextApp
