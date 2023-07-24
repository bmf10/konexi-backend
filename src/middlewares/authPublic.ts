import type { RequestHandler } from 'express'
import { verify } from '../utils/jwt'
import User, { type UserDoc, type IUser } from '../models/User'
import type { TokenPayload } from '../types'

const authHeader = (auth?: string) => {
  if (auth && auth.startsWith('Bearer')) {
    return auth.substring(7)
  }
}

const authPublicMiddleware: RequestHandler = async (req, _res, next) => {
  try {
    const token = authHeader(req.get('Authorization'))
    if (token) {
      const { payload } = await verify<TokenPayload>(token)
      const user: UserDoc | null = await User.findById(payload._id).exec()

      req.ctx.user = {
        ...(user?.toJSON() as IUser),
        expires: payload.expires,
      }
    }
    next()
  } catch (error) {
    next(error)
  }
}

export default authPublicMiddleware
