import { Router } from 'express'
import { sign } from 'jsonwebtoken'
import { hash } from 'bcryptjs'
import { isEmail } from 'validator'

import { UserModel, FollowerModel, ProfileModel, NotificationModel, ChatModel } from '~/models'

const userPng = 'https://res.cloudinary.com/indersingh/image/upload/v1593464618/App/user_mklcpl.png'

const regexUserName = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/

export const routerSignUp = Router()

routerSignUp.get('/:username', async (req, res) => {
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

routerSignUp.post('/', async (req, res) => {
  const { name, email, username, password, bio, facebook, youtube, twitter, instagram } =
    req.body.user

  if (!isEmail(email)) return res.status(401).send('Invalid Email')

  if (password.length < 6) {
    return res.status(401).send('Password must be atleast 6 characters')
  }

  try {
    let user

    user = await UserModel.findOne({ email: email.toLowerCase() })

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

    user.password = await hash(password, 10)

    await user.save()

    const profileFields: any = {}

    profileFields.user = user._id

    profileFields.bio = bio

    profileFields.social = {}

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

    await new ProfileModel(profileFields).save()
    await new FollowerModel({ user: user._id, followers: [], following: [] }).save()
    await new NotificationModel({ user: user._id, notifications: [] }).save()
    await new ChatModel({ user: user._id, chats: [] }).save()

    const payload = { userId: user._id }
    sign(payload, process.env.jwtSecret, { expiresIn: '2d' }, (err, token) => {
      if (err) throw err
      res.status(200).json(token)
    })
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server error`)
  }
})
