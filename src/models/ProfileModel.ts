import { Schema, Document, model } from 'mongoose'
import type { IUser } from '~/models'

interface IProfileSocial {
  facebook?: string
  twitter?: string
  youtube?: string
  instagram?: string
}

export interface IProfileData {
  user: IUser[`_id`]
  bio: string
  social: IProfileSocial
}

export interface IProfile extends IProfileData, Document {}

const ProfileSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: `User` },
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

export const ProfileModel = model<IProfile>(`Profile`, ProfileSchema)
