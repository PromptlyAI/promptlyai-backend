import { Request, Response, Router } from 'express'
import {
  ForgotPasswordDto,
  RegisterDto,
  ResetPasswordDto,
  UserDto,
} from '../interfaces/UserDtos'
import {
  register,
  login,
  deleteUser,
  forgotPassword,
  resetPassword,
} from '../services/userService'
import verifyToken from '../middleware/verify'
const router = Router()

router.get('/get-user-info', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user
    res.send({
      name: user.name,
      email: user.email,
      totalTokenBalance: user.totalTokenBalance,
      role: user.role,
      createdAt: user.createdAt,
      isBanned: user.isBanned,
      banExpirationDate: user.banExpirationDate,
    })
  } catch (error) {
    return res.status(400).send(error)
  }
})

router.post(
  '/register',
  async (req: Request<{}, {}, RegisterDto>, res: Response) => {
    try {
      await register(req.body)
      return res.send('User created')
    } catch (error) {
      return res.status(400).send(error)
    }
  },
)

router.post('/login', async (req: Request<{}, {}, UserDto>, res: Response) => {
  try {
    const token = await login(req.body)
    return res.send(token)
  } catch (error) {
    console.log(error)
    return res.status(400).send(error)
  }
})

router.delete('/', verifyToken, async (req: Request, res: Response) => {
  try {
    await deleteUser((req as any).user)
    return res.send('User deleted')
  } catch (error) {
    return res.status(400).send(error)
  }
})

router.post(
  '/forgotPassword',
  async (req: Request<{}, {}, ForgotPasswordDto>, res: Response) => {
    try {
      res.send(await forgotPassword(req.body.email))
    } catch (error) {
      return res.status(400).send(error)
    }
  },
)

router.patch(
  '/resetPassword',
  async (req: Request<{}, {}, ResetPasswordDto>, res: Response) => {
    try {
      await resetPassword(req.body.token, req.body.newPassword)
      res.send('Password has been reset')
    } catch (error) {
      return res.status(400).send(error)
    }
  },
)

export default router
