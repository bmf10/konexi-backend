import { Router } from 'express'
import auth from './auth'
import user from './user'
import post from './post'
import like from './like'
import comment from './comment'

const router = Router()

router.use('/auth', auth)
router.use('/user', user)
router.use('/post', post)
router.use('/like', like)
router.use('/comment', comment)

export default router
