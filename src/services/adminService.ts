import { PrismaClient } from '@prisma/client'
import { UUID } from 'crypto'

const prisma = new PrismaClient()

export async function changeTokenBalance(
  adminId: UUID,
  userId: UUID,
  newTokenBalance: number,
) {
  await verifyAdmin(adminId)
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      totalTokenBalance: newTokenBalance,
    },
  })
}

export async function changeUserRole(
  adminId: UUID,
  userId: UUID,
  newRole: string,
) {
  await verifyAdmin(adminId)
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      role: newRole,
    },
  })
}

export async function getAllUsers(adminId: UUID) {
  await verifyAdmin(adminId)
  const data = await prisma.user.findMany()
  const returnValue = data.map((data) => {
    data.id, data.name, data.email, data.role, data.totalTokenBalance
  })

  return returnValue;
}

async function verifyAdmin(adminId: UUID) {
  const admin = await prisma.user.findFirst(adminId)

  if (!admin || admin.role !== 'admin') {
    throw new Error('Invalid admin')
  }
}
