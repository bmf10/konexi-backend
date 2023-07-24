import mongoose, { type Document, type SchemaTimestampsConfig } from 'mongoose'

export interface ILike extends SchemaTimestampsConfig {
  readonly _id: mongoose.Types.ObjectId
  readonly user: mongoose.Types.ObjectId
  readonly post: mongoose.Types.ObjectId
}

export type LikeDoc = ILike & Document

const LikeSchema = new mongoose.Schema<ILike>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  },
  { timestamps: true },
)

export default mongoose.models.LikeSchema || mongoose.model('Like', LikeSchema)
