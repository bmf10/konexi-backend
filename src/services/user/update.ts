import { type RequestHandler, Router } from 'express'
import { BadRequestError } from 'express-response-errors'
import { Joi, type schema, validate } from 'express-validation'
import User, { type UserDoc } from '../../models/User'
import { successResponse } from '../../utils/response'
import authMiddleware from '../../middlewares/auth'

interface Body {
  readonly name: string
  readonly email: string
}

const validationSchema: schema = {
  body: Joi.object<Body>({
    email: Joi.string().email().trim(),
    name: Joi.string().trim(),
  }),
}

const requestHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = req.ctx.user!
    const body = req.body as Body

    if (body.email) {
      const userEmail: UserDoc = await User.findOne({
        email: body.email,
      }).exec()

      if (userEmail.id !== user._id.toString()) {
        return next(new BadRequestError('Email Already Used'))
      }
    }

    const newUser: UserDoc = await User.findByIdAndUpdate(
      { _id: user._id },
      body,
      { returnDocument: 'after' },
    ).exec()

    return res.json(
      successResponse({ user: { ...newUser.toJSON(), password: undefined } }),
    )
  } catch (error) {
    next(error)
  }
}

const router = Router()

router.put(
  '/update',
  authMiddleware,
  validate(validationSchema, { context: true }),
  requestHandler,
)

export default router
