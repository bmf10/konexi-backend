import express, { Express, json, urlencoded } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { logger, errorLogger } from './logger'
import mongoose from 'mongoose'
import services from './services'
import errors from './errors'
import context from './middlewares/context'
import { firebaseInit } from './utils/firebase'

dotenv.config()

const app: Express = express()
const port = process.env.PORT || 8000
const mongoDbUri = process.env.MONGO_DB_URI || ''

app.use(firebaseInit)

app.use(json())
app.use(urlencoded({ extended: false }))

app.use(cors())

app.use(context())

app.use(logger)

app.use(services)

app.get('/', (_req, res) => {
  res.send('Hello World!')
})

app.use(errorLogger)

app.use(errors)

void mongoose.connect(mongoDbUri).then(() => {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`)
  })
})
