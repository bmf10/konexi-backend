import { IUser } from '../models/User'

export interface RequestContext {
  user?: IUser & {
    expires: string
  }
}

export interface TokenPayload {
  readonly _id: string
  readonly expires: string
}

export type File = Express.Multer.File

export interface ParsedFile {
  readonly [k: string]: File | ParsedFile | ParsedFile[]
}
