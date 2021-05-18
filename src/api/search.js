import { Router } from 'express'

import { authMiddleware } from '../middleware'
import { UserModel } from '../models/UserModel'

const router = Router()

router.get('/:searchText', authMiddleware, async (req, res) => {
  try {
    const { searchText } = req.params
    const { userId } = req

    if (searchText.length === 0) return

    let userPattern = new RegExp(`^${searchText}`)

    const results = await UserModel.find({
      name: { $regex: userPattern, $options: 'i' },
    })

    const resultsToBeSent =
      results.length > 0 && results.filter((result) => result._id.toString() !== userId)

    return res.status(200).json(resultsToBeSent.length > 0 ? resultsToBeSent : results)
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server error`)
  }
})

export default router