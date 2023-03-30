import { PrismaClient } from '@prisma/client'
import { UUID } from 'crypto'
import dotenv from 'dotenv'

dotenv.config()
const tokenSecret = process.env.TOKEN_SECRET
const prisma = new PrismaClient()

export async function changeTokenBalance(
  adminId: UUID,
  userId: UUID,
  newTokenBalance: number,
) {
  const admin = await prisma.user.findFirst(adminId)

  if (!admin || admin.role !== 'admin') {
    throw new Error('Invalid admin')
  }

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      totalTokenBalance: newTokenBalance
    },
  });
}
