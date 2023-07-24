import {
  PutObjectCommand,
  type PutObjectCommandOutput,
  S3Client,
  DeleteObjectCommand,
  type DeleteObjectCommandOutput,
} from '@aws-sdk/client-s3'
import fs from 'fs'

const s3 = new S3Client({
  apiVersion: '2006-03-01',
  credentials: {
    accessKeyId: process.env.S3_KEY || '',
    secretAccessKey: process.env.S3_SECRET || '',
  },
  endpoint: 'https://s3.filebase.com',
  region: 'us-east-1',
  forcePathStyle: true,
})

export interface SaveParams {
  readonly key: string
  readonly body: string
  readonly cacheControl?: string
  readonly isPublic?: boolean
  readonly contentType?: string
}

export const save = async ({
  key,
  body,
  cacheControl,
  isPublic,
  contentType,
}: SaveParams): Promise<PutObjectCommandOutput> => {
  const stream = fs.createReadStream(body)
  try {
    const upload = await s3.send(
      new PutObjectCommand({
        Key: key,
        Body: stream,
        Bucket: 'posts',
        CacheControl: cacheControl || 'private, max-age=604800, immutable',
        ACL: isPublic ? 'public-read' : undefined,
        ContentType: contentType,
      }),
    )

    return upload
  } finally {
    stream.close()
  }
}

export interface SaveMulterFileParams {
  readonly file: Express.Multer.File
  readonly directory: string
  readonly cacheControl?: string
  readonly isPublic?: boolean
  readonly contentType?: string
}

export const remove = async (
  key: string,
): Promise<DeleteObjectCommandOutput> => {
  const remove = await s3.send(
    new DeleteObjectCommand({ Key: key, Bucket: 'posts' }),
  )
  return remove
}
