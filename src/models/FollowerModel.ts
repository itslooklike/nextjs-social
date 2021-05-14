import mongoose, { Schema, Document } from 'mongoose'
import { IUserDocument } from './UserModel'

export interface IFollower {
  user: IUserDocument['_id']
  followers: Array<{ user: IUserDocument['_id'] }>
  following: Array<{ user: IUserDocument['_id'] }>
}

interface IFollowerBaseDocument extends IFollower, Document {}

const FollowerSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    followers: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    following: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
)

export default mongoose.model<IFollowerBaseDocument>('Follower', FollowerSchema)
