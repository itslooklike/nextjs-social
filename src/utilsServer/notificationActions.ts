import { UserModel, NotificationModel } from '~/models'

export const setNotificationToUnread = async (userId) => {
  try {
    const user = await UserModel.findById(userId)

    if (!user.unreadNotification) {
      user.unreadNotification = true
      await user.save()
    }

    return
  } catch (error) {
    console.error(error)
  }
}

export const newLikeNotification = async (userId, postId, userToNotifyId) => {
  try {
    const userToNotify = await NotificationModel.findOne({ user: userToNotifyId })

    const newNotification = {
      type: `newLike`,
      user: userId,
      post: postId,
      date: Date.now(),
    }

    // @ts-ignore
    await userToNotify.notifications.unshift(newNotification)

    await userToNotify.save()

    await setNotificationToUnread(userToNotifyId)
    return
  } catch (error) {
    console.error(error)
  }
}

export const removeLikeNotification = async (userId, postId, userToNotifyId) => {
  try {
    const user = await NotificationModel.findOne({ user: userToNotifyId })

    const notificationToRemove = await user.notifications.find(
      (notification) =>
        notification.type === `newLike` &&
        notification.user.toString() === userId &&
        notification.post.toString() === postId
    )

    const indexOf = user.notifications
      // @ts-ignore
      .map((notification) => notification._id.toString())
      // @ts-ignore
      .indexOf(notificationToRemove._id.toString())

    await user.notifications.splice(indexOf, 1)

    await user.save()

    return
  } catch (error) {
    console.error(error)
  }
}

export const newCommentNotification = async (postId, commentId, userId, userToNotifyId, text) => {
  try {
    const userToNotify = await NotificationModel.findOne({ user: userToNotifyId })

    const newNotification = {
      type: `newComment`,
      user: userId,
      post: postId,
      commentId,
      text,
      date: Date.now(),
    }

    // @ts-ignore
    await userToNotify.notifications.unshift(newNotification)

    await userToNotify.save()

    await setNotificationToUnread(userToNotifyId)
    return
  } catch (error) {
    console.error(error)
  }
}

export const removeCommentNotification = async (postId, commentId, userId, userToNotifyId) => {
  try {
    const user = await NotificationModel.findOne({ user: userToNotifyId })

    const notificationToRemove = await user.notifications.find(
      (notification) =>
        notification.type === `newComment` &&
        notification.user.toString() === userId &&
        notification.post.toString() === postId &&
        notification.commentId === commentId
    )

    const indexOf = await user.notifications
      // @ts-ignore
      .map((notification) => notification._id.toString())
      // @ts-ignore
      .indexOf(notificationToRemove._id.toString())

    await user.notifications.splice(indexOf, 1)
    await user.save()
  } catch (error) {
    console.error(error)
  }
}

export const newFollowerNotification = async (userId, userToNotifyId) => {
  try {
    const user = await NotificationModel.findOne({ user: userToNotifyId })

    const newNotification = {
      type: `newFollower`,
      user: userId,
      date: Date.now(),
    }

    // @ts-ignore
    await user.notifications.unshift(newNotification)

    await user.save()

    await setNotificationToUnread(userToNotifyId)
    return
  } catch (error) {
    console.error(error)
  }
}

export const removeFollowerNotification = async (userId, userToNotifyId) => {
  try {
    const user = await NotificationModel.findOne({ user: userToNotifyId })

    const notificationToRemove = await user.notifications.find(
      (notification) =>
        notification.type === `newFollower` && notification.user.toString() === userId
    )

    const indexOf = await user.notifications
      // @ts-ignore
      .map((notification) => notification._id.toString())
      // @ts-ignore
      .indexOf(notificationToRemove._id.toString())

    await user.notifications.splice(indexOf, 1)

    await user.save()
  } catch (error) {
    console.error(error)
  }
}
