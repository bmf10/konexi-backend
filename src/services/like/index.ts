import { Router } from 'express'
import action from './action'

const router = Router()

router.use(action)

export default router
