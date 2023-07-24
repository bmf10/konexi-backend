import { type RequestHandler, Router } from 'express'
import Post, { type PostDoc } from '../../models/Post'
import { successResponse } from '../../utils/response'
import moment from 'moment'
import authMiddleware from '../../middlewares/auth'

const requestHandler: RequestHandler = async (req, res, next) => {
  const id = req.params.id
  const user = req.ctx.user!
  try {
    const post: PostDoc | null = await Post.findOneAndUpdate(
      { _id: id, user: user._id },
      {
        $set: {
          deletedAt: moment().toISOString(),
        },
      },
    )

    return res.json(
      successResponse({
        post: post?.toJSON(),
      }),
    )
  } catch (error) {
    next(error)
  }
}

const router = Router()

router.delete('/:id/archive', authMiddleware, requestHandler)

export default router
