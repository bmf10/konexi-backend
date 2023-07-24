import { Router } from 'express'
import register from './register'
import login from './login'
import session from './session'

const router = Router()

router.use(register)
router.use(login)
router.use(session)

export default router
