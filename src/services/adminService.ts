import { PrismaClient, Role } from "@prisma/client";
import { UUID } from "crypto";

const prisma = new PrismaClient();

export async function changeTokenBalance(
  adminId: UUID,
  userId: UUID,
  newTokenBalance: number
) {
  await verifyAdmin(adminId);
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      totalTokenBalance: newTokenBalance,
    },
  });
}

export async function changeUserRole(
  adminId: UUID,
  userId: UUID,
  newRole: Role
) {
  await verifyAdmin(adminId);
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      role: newRole,
    },
  });
}



export async function getAllUsers(adminId: UUID) {
  await verifyAdmin(adminId);
  const data = await prisma.user.findMany();
  const returnValue = data.map((data) => {
    data.id, data.name, data.email, data.role, data.totalTokenBalance;
  });

  return returnValue;
}

export async function searchUsers(adminId: UUID, search: string) {
  await verifyAdmin(adminId);
  const data = await prisma.user.findMany({
    where: {
      email: search,
      name: search,
      id: search,
    },
  });

  const returnValue = data.map((data) => {
    data.id, data.name, data.email, data.role, data.totalTokenBalance;
  });

  return returnValue;
}

async function verifyAdmin(adminId: UUID) {
  const admin = await prisma.user.findFirst(adminId);

  if (!admin || admin.role !== Role.ADMIN) {
    throw new Error("Invalid admin");
  }
}
