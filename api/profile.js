import { Router } from 'express'
import { compare, hash } from 'bcryptjs'

import authMiddleware from '../middleware/authMiddleware'
import { findOne, findById } from '../models/UserModel'
import { find } from '../models/PostModel'
import { findOne as _findOne } from '../models/FollowerModel'
import { findOne as __findOne, findOneAndUpdate } from '../models/ProfileModel'
import {
  newFollowerNotification,
  removeFollowerNotification,
} from '../utilsServer/notificationActions'

const router = Router()

router.get('/:username', authMiddleware, async (req, res) => {
  try {
    const { username } = req.params

    const user = await findOne({ username: username.toLowerCase() })
    if (!user) {
      return res.status(404).send('No User Found')
    }

    const profile = await __findOne({ user: user._id }).populate('user')

    const profileFollowStats = await _findOne({ user: user._id })

    return res.json({
      profile,

      followersLength:
        profileFollowStats.followers.length > 0 ? profileFollowStats.followers.length : 0,

      followingLength:
        profileFollowStats.following.length > 0 ? profileFollowStats.following.length : 0,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).send('Server Error')
  }
})

router.get(`/posts/:username`, authMiddleware, async (req, res) => {
  try {
    const { username } = req.params

    const user = await findOne({ username: username.toLowerCase() })
    if (!user) {
      return res.status(404).send('No User Found')
    }

    const posts = await find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate('user')
      .populate('comments.user')

    return res.json(posts)
  } catch (error) {
    console.error(error)
    return res.status(500).send('Server Error')
  }
})

router.get('/followers/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params

    const user = await _findOne({ user: userId }).populate('followers.user')

    return res.json(user.followers)
  } catch (error) {
    console.error(error)
    return res.status(500).send('Server Error')
  }
})

router.get('/following/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params

    const user = await _findOne({ user: userId }).populate('following.user')

    return res.json(user.following)
  } catch (error) {
    console.error(error)
    return res.status(500).send('Server Error')
  }
})

router.post('/follow/:userToFollowId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req
    const { userToFollowId } = req.params

    const user = await _findOne({ user: userId })
    const userToFollow = await _findOne({ user: userToFollowId })

    if (!user || !userToFollow) {
      return res.status(404).send('User not found')
    }

    const isFollowing =
      user.following.length > 0 &&
      user.following.filter((following) => following.user.toString() === userToFollowId).length > 0

    if (isFollowing) {
      return res.status(401).send('User Already Followed')
    }

    await user.following.unshift({ user: userToFollowId })
    await user.save()

    await userToFollow.followers.unshift({ user: userId })
    await userToFollow.save()

    await newFollowerNotification(userId, userToFollowId)

    return res.status(200).send('Updated')
  } catch (error) {
    console.error(error)
    return res.status(500).send('Server Error')
  }
})

router.put('/unfollow/:userToUnfollowId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req
    const { userToUnfollowId } = req.params

    const user = await _findOne({
      user: userId,
    })

    const userToUnfollow = await _findOne({
      user: userToUnfollowId,
    })

    if (!user || !userToUnfollow) {
      return res.status(404).send('User not found')
    }

    const isFollowing =
      user.following.length > 0 &&
      user.following.filter((following) => following.user.toString() === userToUnfollowId)
        .length === 0

    if (isFollowing) {
      return res.status(401).send('User Not Followed before')
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

    return res.status(200).send('Updated')
  } catch (error) {
    console.error(error)
    res.status(500).send('server error')
  }
})

router.post('/update', authMiddleware, async (req, res) => {
  try {
    const { userId } = req

    const { bio, facebook, youtube, twitter, instagram, profilePicUrl } = req.body

    let profileFields = {}
    profileFields.user = userId

    profileFields.bio = bio

    profileFields.social = {}

    if (facebook) profileFields.social.facebook = facebook

    if (youtube) profileFields.social.youtube = youtube

    if (instagram) profileFields.social.instagram = instagram

    if (twitter) profileFields.social.twitter = twitter

    await findOneAndUpdate({ user: userId }, { $set: profileFields }, { new: true })

    if (profilePicUrl) {
      const user = await findById(userId)
      user.profilePicUrl = profilePicUrl
      await user.save()
    }

    return res.status(200).send('Success')
  } catch (error) {
    console.error(error)
    return res.status(500).send('Server Error')
  }
})

router.post('/settings/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (newPassword.length < 6) {
      return res.status(400).send('Password must be atleast 6 characters')
    }

    const user = await findById(req.userId).select('+password')

    const isPassword = await compare(currentPassword, user.password)

    if (!isPassword) {
      return res.status(401).send('Invalid Password')
    }

    user.password = await hash(newPassword, 10)
    await user.save()

    res.status(200).send('Updated successfully')
  } catch (error) {
    console.error(error)
    return res.status(500).send('Server Error')
  }
})

router.post('/settings/messagePopup', authMiddleware, async (req, res) => {
  try {
    const user = await findById(req.userId)

    if (user.newMessagePopup) {
      user.newMessagePopup = false
    } else {
      user.newMessagePopup = true
    }

    await user.save()
    return res.status(200).send('updated')
  } catch (error) {
    console.error(error)
    return res.status(500).send('Server Error')
  }
})

export default router
