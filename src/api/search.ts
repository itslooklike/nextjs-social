import { Router, Request, Response } from 'express'

import { authMiddleware } from '~/middleware'
import { UserModel } from '~/models'

export const routerSearch = Router()

routerSearch.get(`/:searchText`, authMiddleware, async (req: Request, res: Response) => {
  try {
    const { searchText } = req.params
    const { userId } = res.locals

    if (searchText.length === 0) {
      return
    }

    const userPattern = new RegExp(`^${searchText}`)

    const results = await UserModel.find({
      name: { $regex: userPattern, $options: `i` },
    })

    const resultsToBeSent =
      results.length > 0 && results.filter((result) => result._id.toString() !== userId)

    const data = resultsToBeSent.length > 0 ? resultsToBeSent : results

    return res.status(200).json(data)
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server error`)
  }
})
