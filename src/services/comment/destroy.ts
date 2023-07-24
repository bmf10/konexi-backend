import authMiddleware from '../../middlewares/auth'
import { type RequestHandler, Router } from 'express'
import { successResponse } from '../../utils/response'
import Comment from '../../models/Comment'

const requestHandler: RequestHandler = async (req, res, next) => {
  const user = req.ctx.user!
  const id = req.params.id
  try {
    await Comment.findOneAndDelete({ _id: id, user: user._id })

    return res.json(successResponse({}))
  } catch (error) {
    next(error)
  }
}

const router = Router()

router.delete('/:id', authMiddleware, requestHandler)

export default router
