import { Schema, Document, model } from 'mongoose'
import type { IUser } from '~/models'

export interface IMessage {
  _id: string
  msg: string
  sender: IUser[`_id`]
  receiver: IUser[`_id`]
  date: number
}

export interface IChat extends Document {
  user: IUser[`_id`]
  chats: Array<{
    messagesWith: IUser
    messages: IMessage[]
  }>
}

const ChatSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: `User` },
  chats: [
    {
      messagesWith: { type: Schema.Types.ObjectId, ref: `User` },
      messages: [
        {
          msg: { type: String, required: true },
          sender: { type: Schema.Types.ObjectId, ref: `User`, required: true },
          receiver: { type: Schema.Types.ObjectId, ref: `User`, required: true },
          date: { type: Date },
        },
      ],
    },
  ],
})

export const ChatModel = model<IChat>(`Chat`, ChatSchema)
