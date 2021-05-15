import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import isEmail from 'validator/lib/isEmail'

import UserModel from '~/models/UserModel'
import ProfileModel, { IProfile } from '~/models/ProfileModel'
import FollowerModel from '~/models/FollowerModel'
import { userPng } from '~/utilsServer/userPng'

const router = express.Router()

const regexUserName = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/

router.get('/:username', async (req, res) => {
  const { username } = req.params

  if (username.length < 1) {
    return res.status(401).send('Invalid')
  }

  if (!regexUserName.test(username)) {
    return res.status(401).send('Invalid')
  }

  try {
    const user = await UserModel.findOne({ username: username.toLowerCase() })

    if (user) {
      return res.status(401).send('Username already taken')
    }

    return res.status(200).send('Available')
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server error`)
  }
})

router.post('/', async (req, res) => {
  const { name, email, username, password, bio, facebook, youtube, twitter, instagram } =
    req.body.user

  if (!isEmail(email)) {
    return res.status(401).send('Invalid Email')
  }

  if (password.length < 6) {
    return res.status(401).send('Password must be atleast 6 characters')
  }

  try {
    let user = await UserModel.findOne({ email: email.toLowerCase() })

    if (user) {
      return res.status(401).send('User already registered')
    }

    user = new UserModel({
      name,
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password,
      profilePicUrl: req.body.profilePicUrl || userPng,
    })

    user.password = await bcrypt.hash(password, 10)

    await user.save()

    let profileFields: IProfile = {
      user: user._id,
      bio: bio,
      social: {},
    }

    if (facebook) profileFields.social.facebook = facebook
    if (youtube) profileFields.social.youtube = youtube
    if (instagram) profileFields.social.instagram = instagram
    if (twitter) profileFields.social.twitter = twitter

    await new ProfileModel(profileFields).save()

    await new FollowerModel({ user: user._id, followers: [], following: [] }).save()

    const payload = { userId: user._id }

    jwt.sign(payload, process.env.jwtSecret, { expiresIn: '2d' }, (err, token) => {
      if (err) {
        throw err
      }

      res.status(200).json(token)
    })
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server error`)
  }
})

export default router
