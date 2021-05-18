import { verify } from 'jsonwebtoken'

/**
 * Проверяет `headers.authorization` на валидность токена
 */
export const authMiddleware = (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).send(`Unauthorized`)
    }

    const { userId } = verify(req.headers.authorization, process.env.jwtSecret)

    req.userId = userId

    next()
  } catch (error) {
    console.error(error)
    return res.status(401).send(`Unauthorized`)
  }
}
