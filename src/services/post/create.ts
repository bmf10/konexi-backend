import { type schema, validate } from 'express-validation'
import { type File } from '../../types'
import Joi from '../../utils/joi'
import authMiddleware from '../../middlewares/auth'
import { type RequestHandler, Router } from 'express'
import formDataParser from '../../middlewares/file'
import multerFileParser from '../../middlewares/multerFileParser'
import { successResponse } from '../../utils/response'
import { deleteFile, uploadFile } from '../../utils/firebase'
import Post, { type PostDoc } from '../../models/Post'
import { cleanUpFiles } from '../../utils/storage'

interface Body {
  readonly title: string
  readonly image: File
  readonly content: string
}

const maxSize = 2048 * 1000 // 2MB

const validationSchema: schema = {
  body: Joi.object<Body>({
    title: Joi.string().required(),
    content: Joi.string().required(),
    image: Joi.file().maxSize(maxSize).image().required(),
  }),
}

const requestHandler: RequestHandler = async (req, res, next) => {
  const user = req.ctx.user!
  const body = req.body as Body
  let image: string | undefined
  try {
    image = await uploadFile(body.image)

    const post: PostDoc = await Post.create({
      ...body,
      image,
      user: user._id,
    })
    const imageUrl = await post.getImageUrl()

    return res.json(
      successResponse({ post: { ...post.toJSON(), imageUrl: imageUrl } }),
    )
  } catch (error) {
    if (image) {
      await deleteFile(image)
    }
    next(error)
  } finally {
    if (body.image) {
      await cleanUpFiles([body.image])
    }
  }
}

const router = Router()

router.post(
  '/',
  authMiddleware,
  formDataParser.single('image'),
  multerFileParser(),
  validate(validationSchema, {
    context: true,
  }),
  requestHandler,
)

export default router
