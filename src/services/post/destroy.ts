import { type RequestHandler, Router } from 'express'
import Post, { type PostDoc } from '../../models/Post'
import { successResponse } from '../../utils/response'
import authMiddleware from '../../middlewares/auth'
import { deleteFile } from '../../utils/firebase'
import { UnprocessableEntityError } from 'express-response-errors'

const requestHandler: RequestHandler = async (req, res, next) => {
  const id = req.params.id
  const user = req.ctx.user!
  try {
    const post: PostDoc | null = await Post.findOne({
      _id: id,
      user: user._id,
      deletedAt: { $ne: null },
    })

    if (!post) {
      next(new UnprocessableEntityError())
    }

    await deleteFile(post!.image)

    await post?.deleteOne()

    return res.json(successResponse({}))
  } catch (error) {
    next(error)
  }
}

const router = Router()

router.delete('/:id', authMiddleware, requestHandler)

export default router
