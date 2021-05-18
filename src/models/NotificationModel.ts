import { Schema, Document, model } from 'mongoose'
import type { IUser, IPost } from '~/models'

interface INotify {
  user: IUser[`_id`]
  post: IPost[`_id`]
  type: `newLike` | `newComment` | `newFollower`
  commentId: string
  text: string
  date: number
}

export interface INotification extends Document {
  user: IUser[`_id`]
  notifications: INotify[]
}

const NotificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: `User` },
  notifications: [
    {
      type: { type: String, enum: [`newLike`, `newComment`, `newFollower`] },
      user: { type: Schema.Types.ObjectId, ref: `User` },
      post: { type: Schema.Types.ObjectId, ref: `Post` },
      commentId: { type: String },
      text: { type: String },
      date: { type: Date, default: Date.now },
    },
  ],
})

export const NotificationModel = model<INotification>(`Notification`, NotificationSchema)
