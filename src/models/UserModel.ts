import mongoose, { Schema, Document } from 'mongoose'

interface IUser {
  name: string
  email: string
  password: string
  username: string
  profilePirUrl?: string
  newMessagePopup: boolean
  unreadMessage: boolean
  unreadNotification: boolean
  role: 'user' | 'root'
  resetToken?: string
  expireToken?: Date
}

export interface IUserDocument extends IUser, Document {}

const UserSchema = new Schema(
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
    },
    profilePirUrl: {
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
      default: 'user',
      enum: ['user', 'root'],
    },
    resetToken: {
      type: String,
    },
    expireToken: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model<IUserDocument>('User', UserSchema)
