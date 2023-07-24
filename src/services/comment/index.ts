import { Router } from 'express'
import create from './create'
import get from './get'
import destroy from './destroy'

const router = Router()

router.use(create)
router.use(get)
router.use(destroy)

export default router
