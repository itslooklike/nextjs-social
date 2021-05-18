import { Schema, Document, model } from 'mongoose'
import type { IUser } from '~/models'

export interface IFollower extends Document {
  user: IUser[`_id`]
  followers: Array<{ user: IUser[`_id`] }>
  following: Array<{ user: IUser[`_id`] }>
}

const FollowerSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: `User` },
  followers: [
    {
      user: { type: Schema.Types.ObjectId, ref: `User` },
    },
  ],
  following: [
    {
      user: { type: Schema.Types.ObjectId, ref: `User` },
    },
  ],
})

export const FollowerModel = model<IFollower>(`Follower`, FollowerSchema)
