import { type RequestHandler, Router } from 'express'
import authMiddleware from '../../middlewares/auth'
import { successResponse } from '../../utils/response'

const requestHandler: RequestHandler = (req, res) => {
  res.json(successResponse(req.ctx.user))
}

const router = Router()

router.get('/session', authMiddleware, requestHandler)

export default router
