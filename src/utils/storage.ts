import fsP from './fs'
import path from 'path'
import multer from 'multer'
import { toArray, flatten } from 'lodash'
import { save } from './s3'
import { type PutObjectCommandOutput } from '@aws-sdk/client-s3'

export const formDataParser = multer({
  dest: path.resolve(__dirname, '../../temp/multed'),
})

type File = Express.Multer.File

export const cleanUpFiles = async (
  files?:
    | (File | null | undefined)[]
    | { [k: string]: (File | null | undefined)[] }
    | null
    | undefined,
): Promise<void> => {
  if (files) {
    if (Array.isArray(files)) {
      await Promise.all(files.map(cleanUpFile))
    } else {
      await Promise.all(flatten(toArray(files)).map(cleanUpFile))
    }
  }
}

export const cleanUpFile = async (file?: File | null): Promise<void> => {
  if (file) {
    const path = file.path
    if (typeof path === 'string') {
      return fsP.unlink(path)
    }
  }
}

export interface SaveMulterFileParams {
  readonly file: Express.Multer.File
  readonly directory: string
  readonly cacheControl?: string
  readonly isPublic?: boolean
  readonly contentType?: string
}

export const saveMulterFile = ({
  file,
  directory,
  cacheControl,
  isPublic,
  contentType,
}: SaveMulterFileParams): Promise<PutObjectCommandOutput> =>
  save({
    key: `${directory}/${file.filename}-${file.originalname}`,
    body: file.path,
    cacheControl,
    isPublic,
    contentType: contentType || file.mimetype,
  })
