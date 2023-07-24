import type { RequestHandler } from 'express'
import { UnauthorizedError } from 'express-response-errors'
import { verify } from '../utils/jwt'
import User, { type UserDoc, type IUser } from '../models/User'
import type { TokenPayload } from '../types'

const authHeader = (auth?: string) => {
  if (auth && auth.startsWith('Bearer')) {
    return auth.substring(7)
  }
}

const authMiddleware: RequestHandler = async (req, _res, next) => {
  const token = authHeader(req.get('Authorization'))

  if (!token) return next(new UnauthorizedError())
  try {
    const { payload } = await verify<TokenPayload>(token)
    const user: UserDoc | null = await User.findById(payload._id).exec()

    if (!user) {
      next(new UnauthorizedError())
    }

    req.ctx.user = {
      ...(user?.toJSON() as IUser),
      expires: payload.expires,
    }
    next()
  } catch (error) {
    next(new UnauthorizedError())
  }
}

export default authMiddleware
