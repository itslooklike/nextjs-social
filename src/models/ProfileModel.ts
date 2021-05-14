import mongoose, { Schema } from 'mongoose'
import type { IUserDocument } from './UserModel'

export interface IProfile {
  user: IUserDocument['_id']
  bio: string
  social: {
    youtube?: string
    twitter?: string
    facebook?: string
    instagram?: string
  }
}

interface IProfileBaseDocument extends IProfile, Document {}

const ProfileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    bio: {
      type: String,
      required: true,
    },
    social: {
      youtube: { type: String },
      twitter: { type: String },
      facebook: { type: String },
      instagram: { type: String },
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model<IProfileBaseDocument>('Profile', ProfileSchema)
