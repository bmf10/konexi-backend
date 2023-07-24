import { type RequestHandler, Router } from 'express'
import { Joi, type schema, validate } from 'express-validation'
import Post, { type PostDoc } from '../../models/Post'
import { successResponse } from '../../utils/response'
import authPublicMiddleware from '../../middlewares/authPublic'
import Like, { type LikeDoc } from '../../models/Like'

interface Queries {
  readonly page: number
  readonly perPage: number
  readonly search?: string
}

const validationSchema: schema = {
  query: Joi.object<Queries>({
    page: Joi.number().default(1),
    perPage: Joi.number().default(10),
    search: Joi.string(),
  }),
}

const requestHandler: RequestHandler = async (req, res, next) => {
  const user = req.ctx.user
  const { page, perPage, search } = req.query as unknown as Queries
  try {
    const searchCondition = search
      ? { title: { $regex: search, $options: 'i' } }
      : {}
    const posts: unknown[] = await Post.find(searchCondition)
      .skip(perPage * (page - 1))
      .limit(perPage)
      .populate('user', 'name')
      .exec()
    const countPost = await Post.countDocuments(searchCondition)

    const postsWithImageUrl = await Promise.all(
      (posts as PostDoc[]).map(async (v) => {
        let like: LikeDoc | null = null
        if (user) {
          like = await Like.findOne({ post: v._id, user: user._id })
        }
        return {
          ...v.toJSON(),
          imageUrl: await v.getImageUrl(),
          isLiked: Boolean(like),
        }
      }),
    )

    return res.json(
      successResponse({
        posts: postsWithImageUrl,
        perPage,
        page,
        totalData: countPost,
        totalPage: Math.ceil(countPost / perPage),
      }),
    )
  } catch (error) {
    next(error)
  }
}

const router = Router()

router.get(
  '/',
  authPublicMiddleware,
  validate(validationSchema, {
    context: true,
  }),
  requestHandler,
)

export default router
