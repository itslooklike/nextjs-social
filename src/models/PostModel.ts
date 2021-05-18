import { Schema, Document, model } from 'mongoose'
import type { IUser } from '~/models'

interface IComment {
  _id: string
  user: IUser[`_id`]
  text: string
  date: number
}

export interface IPostData {
  user: IUser[`_id`]
  text: string
  location?: string
  picUrl?: string
  likes?: Array<{ user: IUser[`_id`] }>
  comments?: IComment[]
}

interface IPost extends Document, IPostData {}

const PostSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: `User` },
    text: { type: String, required: true },
    location: { type: String },
    picUrl: { type: String },
    likes: [{ user: { type: Schema.Types.ObjectId, ref: `User` } }],
    comments: [
      {
        _id: { type: String, required: true },
        user: { type: Schema.Types.ObjectId, ref: `User` },
        text: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
)

export const PostModel = model<IPost>(`Post`, PostSchema)
