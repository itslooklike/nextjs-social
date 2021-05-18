import { Router, Request, Response } from 'express'
import { compare, hash } from 'bcryptjs'

import { authMiddleware } from '~/middleware'
import { UserModel, PostModel, FollowerModel, ProfileModel } from '~/models'
import type { IProfileData } from '~/models'

import {
  newFollowerNotification,
  removeFollowerNotification,
} from '../utilsServer/notificationActions'

export const routerProfile = Router()

routerProfile.get(`/:username`, authMiddleware, async (req: Request, res: Response) => {
  try {
    const { username } = req.params

    const user = await UserModel.findOne({ username: username.toLowerCase() })

    if (!user) {
      return res.status(404).send(`No User Found`)
    }

    const profile = await ProfileModel.findOne({ user: user._id }).populate(`user`)

    const profileFollowStats = await FollowerModel.findOne({ user: user._id })

    const followersLength =
      profileFollowStats.followers.length > 0 ? profileFollowStats.followers.length : 0

    const followingLength =
      profileFollowStats.following.length > 0 ? profileFollowStats.following.length : 0

    const data = {
      profile,
      followersLength,
      followingLength,
    }

    return res.json(data)
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server Error`)
  }
})

routerProfile.get(`/posts/:username`, authMiddleware, async (req: Request, res: Response) => {
  try {
    const { username } = req.params

    const user = await UserModel.findOne({ username: username.toLowerCase() })

    if (!user) {
      return res.status(404).send(`No User Found`)
    }

    const posts = await PostModel.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate(`user`)
      .populate(`comments.user`)

    return res.json(posts)
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server Error`)
  }
})

routerProfile.get(`/followers/:userId`, authMiddleware, async (_, res: Response) => {
  try {
    const { userId } = res.locals.params

    const user = await FollowerModel.findOne({ user: userId }).populate(`followers.user`)

    return res.json(user.followers)
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server Error`)
  }
})

routerProfile.get(`/following/:userId`, authMiddleware, async (_, res: Response) => {
  try {
    const { userId } = res.locals.params

    const user = await FollowerModel.findOne({ user: userId }).populate(`following.user`)

    return res.json(user.following)
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server Error`)
  }
})

routerProfile.post(
  `/follow/:userToFollowId`,
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { userId } = res.locals
      const { userToFollowId } = req.params

      const user = await FollowerModel.findOne({ user: userId })
      const userToFollow = await FollowerModel.findOne({ user: userToFollowId })

      if (!user || !userToFollow) {
        return res.status(404).send(`User not found`)
      }

      const isFollowing =
        user.following.length > 0 &&
        user.following.filter((following) => following.user.toString() === userToFollowId).length >
          0

      if (isFollowing) {
        return res.status(401).send(`User Already Followed`)
      }

      await user.following.unshift({ user: userToFollowId })
      await user.save()

      await userToFollow.followers.unshift({ user: userId })
      await userToFollow.save()

      await newFollowerNotification(userId, userToFollowId)

      return res.status(200).send(`Updated`)
    } catch (error) {
      console.error(error)
      return res.status(500).send(`Server Error`)
    }
  }
)

routerProfile.put(
  `/unfollow/:userToUnfollowId`,
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { userId } = res.locals
      const { userToUnfollowId } = req.params

      const user = await FollowerModel.findOne({ user: userId })

      const userToUnfollow = await FollowerModel.findOne({ user: userToUnfollowId })

      if (!user || !userToUnfollow) {
        return res.status(404).send(`User not found`)
      }

      const isFollowing =
        user.following.length > 0 &&
        user.following.filter((following) => following.user.toString() === userToUnfollowId)
          .length === 0

      if (isFollowing) {
        return res.status(401).send(`User Not Followed before`)
      }

      const removeFollowing = await user.following
        .map((following) => following.user.toString())
        .indexOf(userToUnfollowId)

      await user.following.splice(removeFollowing, 1)

      await user.save()

      const removeFollower = await userToUnfollow.followers
        .map((follower) => follower.user.toString())
        .indexOf(userId)

      await userToUnfollow.followers.splice(removeFollower, 1)
      await userToUnfollow.save()

      await removeFollowerNotification(userId, userToUnfollowId)

      return res.status(200).send(`Updated`)
    } catch (error) {
      console.error(error)
      res.status(500).send(`server error`)
    }
  }
)

routerProfile.post(`/update`, authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = res.locals

    const { bio, facebook, youtube, twitter, instagram, profilePicUrl } = req.body

    const profileFields: IProfileData = {
      user: userId,
      bio,
      social: {},
    }

    if (facebook) {
      profileFields.social.facebook = facebook
    }

    if (youtube) {
      profileFields.social.youtube = youtube
    }

    if (instagram) {
      profileFields.social.instagram = instagram
    }

    if (twitter) {
      profileFields.social.twitter = twitter
    }

    await ProfileModel.findOneAndUpdate({ user: userId }, { $set: profileFields }, { new: true })

    if (profilePicUrl) {
      const user = await UserModel.findById(userId)
      user.profilePicUrl = profilePicUrl
      await user.save()
    }

    return res.status(200).send(`Success`)
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server Error`)
  }
})

routerProfile.post(`/settings/password`, authMiddleware, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (newPassword.length < 6) {
      return res.status(400).send(`Password must be atleast 6 characters`)
    }

    const user = await UserModel.findById(res.locals.userId).select(`+password`)

    const isPassword = await compare(currentPassword, user.password)

    if (!isPassword) {
      return res.status(401).send(`Invalid Password`)
    }

    user.password = await hash(newPassword, 10)

    await user.save()

    res.status(200).send(`Updated successfully`)
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server Error`)
  }
})

routerProfile.post(`/settings/messagePopup`, authMiddleware, async (_, res: Response) => {
  try {
    const user = await UserModel.findById(res.locals.userId)

    if (user.newMessagePopup) {
      user.newMessagePopup = false
    } else {
      user.newMessagePopup = true
    }

    await user.save()
    return res.status(200).send(`updated`)
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server Error`)
  }
})
