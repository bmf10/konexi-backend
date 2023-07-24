import { Router } from 'express'
import update from './update'

const router = Router()

router.use(update)

export default router
