import { type RequestHandler, Router } from 'express'
import { BadRequestError } from 'express-response-errors'
import { Joi, type schema, validate } from 'express-validation'
import User, { type UserDoc } from '../../models/User'
import { sign } from '../../utils/jwt'
import { verify } from '../../utils/password'
import { successResponse } from '../../utils/response'
import moment from 'moment'
import type { TokenPayload } from '../../types'

interface Params {
  readonly email: string
  readonly password: string
}

const validationSchema: schema = {
  body: Joi.object<Params>({
    email: Joi.string().required().email().trim(),
    password: Joi.string().required(),
  }),
}

const requestHandler: RequestHandler = async (req, res, next) => {
  try {
    const body = req.body as Params

    const user: UserDoc = await User.findOne({
      email: body.email,
    }).exec()

    if (!user) {
      return next(new BadRequestError('Invalid email or password'))
    }

    const isPasswordCorrect = await verify(user.password, body.password)

    if (!isPasswordCorrect) {
      return next(new BadRequestError('Invalid email or password'))
    }

    const expires = moment().add('7', 'days').toISOString()
    const payload: TokenPayload = {
      _id: user._id,
      expires,
    }

    const jwt = await sign(payload)

    return res.json(successResponse({ token: jwt, expires }))
  } catch (error) {
    next(error)
  }
}

const router = Router()

router.post(
  '/login',
  validate(validationSchema, { context: true }),
  requestHandler,
)

export default router
