import dotenv from 'dotenv'
import express, { json } from 'express'
import next from 'next'
import { createServer } from 'http'
import socketIo from 'socket.io'

import {
  routerAuth,
  routerSignUp,
  routerSearch,
  routerProfile,
  routerPosts,
  routerNotifications,
  routerReset,
  routerChats,
} from '~/api'

import connectDb from '~/utilsServer/connectDb'
import { addUser, removeUser, findConnectedUser } from '~/utilsServer/roomActions'
import { loadMessages, sendMsg, setMsgToUnread, deleteMsg } from '~/utilsServer/messageActions'
import { likeOrUnlikePost } from '~/utilsServer/likeOrUnlikePost'

dotenv.config()

const app = express()
const server = createServer(app)
const io = socketIo(server)
const nextApp = next({ dev: process.env.NODE_ENV !== `production` })
const handle = nextApp.getRequestHandler()

const PORT = process.env.PORT || 3000
const HOST = `localhost`

connectDb()

app.use(json())

io.on(`connection`, (socket) => {
  socket.on(`join`, async ({ userId }) => {
    const users = await addUser(userId, socket.id)

    setInterval(() => {
      socket.emit(`connectedUsers`, {
        users: users.filter((user) => user.userId !== userId),
      })
    }, 10000)
  })

  socket.on(`likePost`, async ({ postId, userId, like }) => {
    const { success, name, profilePicUrl, username, postByUserId } = await likeOrUnlikePost(
      postId,
      userId,
      like
    )

    if (success) {
      socket.emit(`postLiked`)

      if (postByUserId !== userId) {
        const receiverSocket = findConnectedUser(postByUserId)

        if (receiverSocket && like) {
          io.to(receiverSocket.socketId).emit(`newNotificationReceived`, {
            name,
            profilePicUrl,
            username,
            postId,
          })
        }
      }
    }
  })

  socket.on(`loadMessages`, async ({ userId, messagesWith }) => {
    const { chat, error } = await loadMessages(userId, messagesWith)

    !error ? socket.emit(`messagesLoaded`, { chat }) : socket.emit(`noChatFound`)
  })

  socket.on(`sendNewMsg`, async ({ userId, msgSendToUserId, msg }) => {
    const { newMsg, error } = await sendMsg(userId, msgSendToUserId, msg)
    const receiverSocket = findConnectedUser(msgSendToUserId)

    if (receiverSocket) {
      io.to(receiverSocket.socketId).emit(`newMsgReceived`, { newMsg })
    } else {
      await setMsgToUnread(msgSendToUserId)
    }

    !error && socket.emit(`msgSent`, { newMsg })
  })

  socket.on(`deleteMsg`, async ({ userId, messagesWith, messageId }) => {
    const { success } = await deleteMsg(userId, messagesWith, messageId)

    if (success) {
      socket.emit(`msgDeleted`)
    }
  })

  socket.on(`sendMsgFromNotification`, async ({ userId, msgSendToUserId, msg }) => {
    const { newMsg, error } = await sendMsg(userId, msgSendToUserId, msg)
    const receiverSocket = findConnectedUser(msgSendToUserId)

    if (receiverSocket) {
      io.to(receiverSocket.socketId).emit(`newMsgReceived`, { newMsg })
    } else {
      await setMsgToUnread(msgSendToUserId)
    }

    !error && socket.emit(`msgSentFromNotification`)
  })

  socket.on(`disconnect`, () => removeUser(socket.id))
})

nextApp.prepare().then(() => {
  app.use(`/api/signup`, routerSignUp)
  app.use(`/api/auth`, routerAuth)
  app.use(`/api/search`, routerSearch)
  app.use(`/api/posts`, routerPosts)
  app.use(`/api/profile`, routerProfile)
  app.use(`/api/notifications`, routerNotifications)
  app.use(`/api/chats`, routerChats)
  app.use(`/api/reset`, routerReset)

  app.all(`*`, (req, res) => handle(req, res))

  server.listen(PORT, () => {
    console.log(`>> START: http://${HOST}:${PORT}`)
  })
})
