import { Schema, model } from 'mongoose'

const ProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    bio: { type: String, required: true },
    social: {
      facebook: { type: String },
      twitter: { type: String },
      youtube: { type: String },
      instagram: { type: String },
    },
  },
  { timestamps: true }
)

export const ProfileModel = model('Profile', ProfileSchema)
