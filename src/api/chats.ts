import { Router, Request, Response } from 'express'

import { UserModel, ChatModel } from '~/models'
import { authMiddleware } from '~/middleware'

export const routerChats = Router()

routerChats.get(`/`, authMiddleware, async (_: Request, res: Response) => {
  try {
    const { userId } = res.locals

    const user = await ChatModel.findOne({ user: userId }).populate(`chats.messagesWith`)

    let chatsToBeSent = []

    if (user.chats.length > 0) {
      chatsToBeSent = await user.chats.map((chat) => ({
        messagesWith: chat.messagesWith._id,
        name: chat.messagesWith.name,
        profilePicUrl: chat.messagesWith.profilePicUrl,
        lastMessage: chat.messages[chat.messages.length - 1].msg,
        date: chat.messages[chat.messages.length - 1].date,
      }))
    }

    return res.json(chatsToBeSent)
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server Error`)
  }
})

routerChats.get(`/user/:userToFindId`, authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findById(req.params.userToFindId)

    if (!user) {
      return res.status(404).send(`No User found`)
    }

    return res.json({ name: user.name, profilePicUrl: user.profilePicUrl })
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server Error`)
  }
})

routerChats.delete(`/:messagesWith`, authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = res.locals
    const { messagesWith } = req.params

    const user = await ChatModel.findOne({ user: userId })

    const chatToDelete = user.chats.find((chat) => chat.messagesWith.toString() === messagesWith)

    if (!chatToDelete) {
      return res.status(404).send(`Chat not found`)
    }

    const indexOf = user.chats.map((chat) => chat.messagesWith.toString()).indexOf(messagesWith)

    user.chats.splice(indexOf, 1)

    await user.save()

    return res.status(200).send(`Chat deleted`)
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server Error`)
  }
})
