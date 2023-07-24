import mongoose, { type SchemaTimestampsConfig, type Document } from 'mongoose'

export interface IUser extends SchemaTimestampsConfig {
  readonly _id: mongoose.Types.ObjectId
  readonly name: string
  readonly email: string
  readonly password: string
  readonly deletedAt?: string
}

export type UserDoc = IUser & Document

const UserSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, require: true },
  },
  { timestamps: true },
)

UserSchema.pre('find', function () {
  void this.where({ deletedAt: null })
})

UserSchema.pre('findOne', function () {
  void this.where({ deletedAt: null })
})

export default mongoose.models.User || mongoose.model('User', UserSchema)
