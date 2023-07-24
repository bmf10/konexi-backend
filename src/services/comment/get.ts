import { type RequestHandler, Router } from 'express'
import { Joi, type schema, validate } from 'express-validation'
import { successResponse } from '../../utils/response'
import Comment, { type CommentDoc } from '../../models/Comment'
import { ObjectId } from 'mongodb'

interface Queries {
  readonly page: number
  readonly perPage: number
  readonly postId: string
}

const validationSchema: schema = {
  query: Joi.object<Queries>({
    page: Joi.number().default(1),
    perPage: Joi.number().default(10),
    postId: Joi.string().required(),
  }),
}

const requestHandler: RequestHandler = async (req, res, next) => {
  const { page, perPage, postId } = req.query as unknown as Queries
  try {
    const searchCondition = { post: new ObjectId(postId) }
    const comments: unknown[] = await Comment.find(searchCondition)
      .skip(perPage * (page - 1))
      .limit(perPage)
      .populate('user', 'name')
      .exec()
    const countPost = await Comment.countDocuments(searchCondition)

    return res.json(
      successResponse({
        comments: (comments as CommentDoc[]).map((v) => v.toJSON()),
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
  validate(validationSchema, {
    context: true,
  }),
  requestHandler,
)

export default router
