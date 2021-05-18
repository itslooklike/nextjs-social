import { Schema, model } from 'mongoose'

const FollowerSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  followers: [
    {
      user: { type: Schema.Types.ObjectId, ref: 'User' },
    },
  ],
  following: [
    {
      user: { type: Schema.Types.ObjectId, ref: 'User' },
    },
  ],
})

export const FollowerModel = model('Follower', FollowerSchema)
