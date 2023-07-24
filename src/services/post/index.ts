import { Router } from 'express'
import create from './create'
import edit from './edit'
import get from './get'
import me from './me'
import archive from './archive'
import destroy from './destroy'

const router = Router()

router.use(create)
router.use(edit)
router.use(get)
router.use(me)
router.use(archive)
router.use(destroy)

export default router
