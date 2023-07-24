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
import { UnauthorizedError } from 'express-response-errors'

interface Body {
  readonly title: string
  readonly image: File
  readonly content: string
}

const maxSize = 2048 * 1000 // 2MB

const validationSchema: schema = {
  body: Joi.object<Body>({
    title: Joi.string(),
    content: Joi.string(),
    image: Joi.file().maxSize(maxSize).image(),
  }),
}

const requestHandler: RequestHandler = async (req, res, next) => {
  const user = req.ctx.user!
  const body = req.body as Body
  const id = req.params.id
  let oldImage: string | undefined
  let image: string | undefined
  try {
    const post: PostDoc = await Post.findById(id).exec()

    if (post.user.toString() !== user._id.toString()) {
      return next(new UnauthorizedError())
    }

    oldImage = post.image
    image = post.image

    if (body.image) {
      image = await uploadFile(body.image)
    }

    post.set({ ...body, image })
    await post.save()
    const imageUrl = await post.getImageUrl()

    if (image !== oldImage) {
      await deleteFile(oldImage)
    }

    return res.json(
      successResponse({ post: { ...post.toJSON(), imageUrl: imageUrl } }),
    )
  } catch (error) {
    if (image && image !== oldImage) {
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

router.put(
  '/:id',
  authMiddleware,
  formDataParser.single('image'),
  multerFileParser(),
  validate(validationSchema, {
    context: true,
  }),
  requestHandler,
)

export default router
