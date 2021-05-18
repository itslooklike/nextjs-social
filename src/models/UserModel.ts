import { Schema, Document, model } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  username: string
  profilePicUrl?: string
  newMessagePopup?: boolean
  unreadMessage?: boolean
  unreadNotification?: boolean
  role?: `user` | `root`
  resetToken?: string
  expireToken?: number
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    profilePicUrl: {
      type: String,
    },
    newMessagePopup: {
      type: Boolean,
      default: true,
    },
    unreadMessage: {
      type: Boolean,
      default: false,
    },
    unreadNotification: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: `user`,
      enum: [`user`, `root`],
    },
    resetToken: {
      type: String,
    },
    expireToken: {
      type: Date,
    },
  },
  { timestamps: true }
)

export const UserModel = model<IUser>(`User`, UserSchema)
