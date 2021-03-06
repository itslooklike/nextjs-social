import { Router } from 'express'
import { sign } from 'jsonwebtoken'
import { compare } from 'bcryptjs'
import { isEmail } from 'validator'

import { UserModel, FollowerModel } from '~/models'
import { authMiddleware } from '~/middleware'

export const routerAuth = Router()

routerAuth.get(`/`, authMiddleware, async (req, res) => {
  const { userId } = res.locals

  try {
    const user = await UserModel.findById(userId)

    const userFollowStats = await FollowerModel.findOne({ user: userId })

    return res.status(200).json({ user, userFollowStats })
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server error`)
  }
})

routerAuth.post(`/`, async (req, res) => {
  const { email, password } = req.body.user

  if (!email || !password) {
    return res.status(401).send(`No "email" and/or "password" send`)
  }

  if (!isEmail(email)) {
    return res.status(401).send(`Invalid Email`)
  }

  if (password.length < 6) {
    return res.status(401).send(`Password must be at least 6 characters`)
  }

  try {
    const user = await UserModel.findOne({ email: email.toLowerCase() }).select(`+password`)

    if (!user) {
      return res.status(401).send(`Invalid Credentials`)
    }

    const isPassword = await compare(password, user.password)

    if (!isPassword) {
      return res.status(401).send(`Invalid Credentials`)
    }

    const payload = { userId: user._id }

    sign(payload, process.env.jwtSecret, { expiresIn: `2d` }, (err, token) => {
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
