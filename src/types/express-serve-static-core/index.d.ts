import { ParsedFile, RequestContext } from '../index'

declare module 'express-serve-static-core' {
  interface Request {
    ctx: RequestContext
    parsedFile: ParsedFile
  }
}
