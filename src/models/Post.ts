import { getStorage } from 'firebase-admin/storage'
import mongoose, { type Document, type SchemaTimestampsConfig } from 'mongoose'

export interface IPost extends SchemaTimestampsConfig {
  readonly _id: mongoose.Types.ObjectId
  readonly title: string
  readonly content: string
  readonly user: mongoose.Types.ObjectId
  readonly image: string
  readonly totalLike: number
  readonly totalComment: number
  readonly deletedAt?: string
}

export type PostDoc = IPost &
  Document & {
    getImageUrl(): Promise<string>
  }

const PostSchema = new mongoose.Schema<IPost>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    image: { type: String },
    totalLike: { type: Number, default: 0 },
    totalComment: { type: Number, default: 0 },
    deletedAt: { type: String },
  },
  { timestamps: true },
)

PostSchema.pre('find', function (this) {
  const query = this.getQuery()
  if (!query.deletedAt) {
    void this.where({ deletedAt: null })
  }
})

PostSchema.pre('findOne', function () {
  const query = this.getQuery()
  if (!query.deletedAt) {
    void this.where({ deletedAt: null })
  }
})

PostSchema.pre('countDocuments', function () {
  const query = this.getQuery()
  if (!query.deletedAt) {
    void this.where({ deletedAt: null })
  }
})

PostSchema.methods.getImageUrl = async function (this: IPost) {
  const bucketName = process.env.FIREBASE_BUCKET_NAME
  const file = getStorage().bucket(bucketName).file(this.image)

  const [signedUrl] = await file.getSignedUrl({
    action: 'read',
    expires: '03-09-2491',
  })

  return signedUrl
}

export default mongoose.models.Post || mongoose.model('Post', PostSchema)
