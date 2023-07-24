import { type RequestHandler, Router } from 'express'
import authMiddleware from '../../middlewares/auth'
import { Joi, type schema, validate } from 'express-validation'
import Post, { type PostDoc } from '../../models/Post'
import { BadRequestError } from 'express-response-errors'
import Like, { type LikeDoc } from '../../models/Like'
import { successResponse } from '../../utils/response'
import { ObjectId } from 'mongodb'

interface Body {
  readonly postId: string
}

const validationSchema: schema = {
  body: Joi.object<Body>({
    postId: Joi.string().required(),
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

    const like: LikeDoc = await Like.findOne({
      user: user._id,
      post: post._id,
    }).exec()

    let newLike

    if (like) {
      await like.deleteOne()
    } else {
      newLike = await Like.create({ user: user._id, post: post._id })
    }

    const countLike = await Like.countDocuments({ post: post._id })

    post.set({ totalLike: countLike })
    await post.save()

    return res.json(successResponse({ like: newLike }))
  } catch (error) {
    next(error)
  }
}

const router = Router()

router.post('/', authMiddleware, validate(validationSchema), requestHandler)

export default router
