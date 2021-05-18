import { Router, Request, Response } from 'express'

import { authMiddleware } from '~/middleware'
import { UserModel, NotificationModel } from '~/models'

export const routerNotifications = Router()

routerNotifications.get(`/`, authMiddleware, async (_: Request, res: Response) => {
  try {
    const { userId } = res.locals

    const user = await NotificationModel.findOne({ user: userId })
      .populate(`notifications.user`)
      .populate(`notifications.post`)

    return res.json(user.notifications)
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server Error`)
  }
})

routerNotifications.post(`/`, authMiddleware, async (_: Request, res: Response) => {
  try {
    const { userId } = res.locals

    const user = await UserModel.findById(userId)

    if (user.unreadNotification) {
      user.unreadNotification = false
      await user.save()
    }
    return res.status(200).send(`Updated`)
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server Error`)
  }
})
