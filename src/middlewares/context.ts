import type { RequestHandler } from 'express'
import type { RequestContext } from '../types'

export default (): RequestHandler => (req, _res, next) => {
  const r = req as unknown as {
    ctx: Partial<RequestContext>
  }
  r.ctx = {}
  next()
}
