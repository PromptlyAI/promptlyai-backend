import verifyToken from '../middleware/verify'
import { Request, Response, Router } from 'express'
import { changeTokenBalance } from '../services/adminService'
import { UUID } from 'crypto'

const router = Router()

router.patch(
  '/changeTokenBalance',
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      await changeTokenBalance(
        (req as any).userId,
        req.body.userId,
        req.body.balance,
      )
      return res.send('Balance changed')
    } catch (error) {
      return res.status(400).send(error)
    }
  },
)

router.patch(
  '/changeUserRole',
  verifyToken,
  async (req: Request, res: Response) => {},
)

router.get(
  '/getAllUsers',
  verifyToken,
  async (req: Request, res: Response) => {},
)

router.get(
  '/seartchUser',
  verifyToken,
  async (req: Request, res: Response) => {},
)

router.patch('/banUser', verifyToken, async (req: Request, res: Response) => {})

export default router
