import mongoose, { type Document, type SchemaTimestampsConfig } from 'mongoose'

export interface IComment extends SchemaTimestampsConfig {
  readonly _id: mongoose.Types.ObjectId
  readonly user: mongoose.Types.ObjectId
  readonly post: mongoose.Types.ObjectId
  readonly comment: string
}

export type CommentDoc = IComment & Document

const CommentSchema = new mongoose.Schema<IComment>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    comment: { type: String, required: true },
  },
  { timestamps: true },
)

export default mongoose.models.CommentSchema ||
  mongoose.model('Comment', CommentSchema)
