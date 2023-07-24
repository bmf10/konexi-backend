import { type RequestHandler, Router } from 'express'
import { Joi, type schema, validate } from 'express-validation'
import { successResponse } from '../../utils/response'
import { BadRequestError } from 'express-response-errors'
import User, { type UserDoc } from '../../models/User'
import { hash } from '../../utils/password'

interface Params {
  readonly name: string
  readonly email: string
  readonly password: string
}

const validationSchema: schema = {
  body: Joi.object<Params>({
    email: Joi.string().required().email().trim(),
    name: Joi.string().required().trim(),
    password: Joi.string().required().min(6),
  }),
}

const requestHandler: RequestHandler = async (req, res, next) => {
  try {
    const body = req.body as Params

    const user: UserDoc = await User.findOne({ email: body.email }).exec()

    if (user) {
      return next(new BadRequestError('Email Already Used'))
    }

    const newUser: UserDoc = await User.create({
      ...body,
      password: await hash(body.password),
    })

    return res.json(successResponse({ user: newUser._id }))
  } catch (error) {
    next(error)
  }
}

const router = Router()

router.post(
  '/register',
  validate(validationSchema, {
    context: true,
  }),
  requestHandler,
)

export default router
