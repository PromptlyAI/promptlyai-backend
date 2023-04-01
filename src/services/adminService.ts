import { PrismaClient, Role } from "@prisma/client";
import { UUID } from "crypto";
import BanDto from "../interfaces/BanDto";

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
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      totalTokenBalance: data.totalTokenBalance,
    };
  });

  return returnValue;
}

export async function searchUsers(adminId: UUID, search: string) {
  await verifyAdmin(adminId);
  const data = await prisma.user.findMany({
    where: {
      OR: [
        {
          email: search,
        },
        {
          name: search,
        },
        {
          id: search,
        },
      ],
    },
  });

  const returnValue = data.map((user) => {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      totalTokenBalance: user.totalTokenBalance,
      isBanned: user.isBanned,
      banExpirationDate: user.banExpirationDate,
    };
  });

  return returnValue;
}

export async function banUser(adminId: UUID, ban: BanDto) {
  await verifyAdmin(adminId);
  console.log(ban);

  
  const existingUser = await prisma.user.findUnique({
    where:{
      id:ban.userId
    }
  });
  

  if (existingUser?.isBanned || !existingUser) {
    throw new Error("User is already banned or does not exist");
  }

  await prisma.bannedUsers.create({
    data: {
      email: existingUser?.email
    },
  });

  await prisma.user.update({
    where: {
      id: ban.userId,
    },
    data: {
      isBanned: true,
      banExpirationDate: ban.banExpartionDate ? new Date(ban.banExpartionDate) : undefined,
    },
  });

  //send email to user

  return "User banned";
}


async function verifyAdmin(adminId: UUID) {
  const admin = await prisma.user.findFirst({
    where: {
      id: adminId,
    },
  });

  if (!admin || admin.role !== Role.ADMIN) {
    throw new Error("Invalid admin");
  }
}
