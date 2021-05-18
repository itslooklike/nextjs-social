import { verify } from 'jsonwebtoken'
import type { Request, Response } from 'express'

/**
 * Проверяет `headers.authorization` на валидность токена
 */
export const authMiddleware = (req: Request, res: Response, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).send(`Unauthorized`)
    }

    const { userId } = verify(req.headers.authorization, process.env.jwtSecret)

    res.locals.userId = userId

    next()
  } catch (error) {
    console.error(error)
    return res.status(401).send(`Unauthorized`)
  }
}
