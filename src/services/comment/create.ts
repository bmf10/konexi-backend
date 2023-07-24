import { Joi, type schema, validate } from 'express-validation'
import authMiddleware from '../../middlewares/auth'
import { type RequestHandler, Router } from 'express'
import { successResponse } from '../../utils/response'
import Post, { type PostDoc } from '../../models/Post'
import Comment, { type CommentDoc } from '../../models/Comment'
import { BadRequestError } from 'express-response-errors'
import { ObjectId } from 'mongodb'

interface Body {
  readonly postId: string
  readonly comment: string
}

const validationSchema: schema = {
  body: Joi.object<Body>({
    postId: Joi.string().required(),
    comment: Joi.string().required().trim(),
  }),
}

const requestHandler: RequestHandler = async (req, res, next) => {
  const user = req.ctx.user!
  const body = req.body as Body
  try {
    const post: PostDoc = await Post.findById(new ObjectId(body.postId)).exec()

    if (!post) {
      next(new BadRequestError())
    }

    const comment: CommentDoc = await Comment.create({
      user: user._id,
      post: post._id,
      comment: body.comment,
    })

    return res.json(successResponse({ comment: comment.toJSON() }))
  } catch (error) {
    next(error)
  }
}

const router = Router()

router.post(
  '/',
  authMiddleware,
  validate(validationSchema, {
    context: true,
  }),
  requestHandler,
)

export default router
