import { PrismaClient, Role, User } from "@prisma/client";
import { UUID } from "crypto";
import BanDto from "../interfaces/BanDto";
import { PatchUserDto } from "../interfaces/UserDtos";

const prisma = new PrismaClient();

export async function changeTokenBalance(
  adminUser: User,
  userId: UUID,
  newTokenBalance: number
) {
  if (adminUser.role !== "ADMIN") {
    throw new Error("Not admin");
  }

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
  adminUser: User,
  userId: UUID,
  newRole: Role
) {
  if (adminUser.role !== "ADMIN") {
    throw new Error("Not admin");
  }
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      role: newRole,
    },
  });
}

export async function getAllUsers(adminUser: User) {
  if (adminUser.role !== "ADMIN") {
    throw new Error("Not admin");
  }
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

export async function searchUsers(adminUser: User, search: string) {
  if (adminUser.role !== "ADMIN") {
    throw new Error("Not admin");
  }
  const data = await prisma.user.findMany({
    where: {
      OR: [
        {
          email: {
            contains: search,
          },
        },
        {
          name: {
            contains: search,
          },
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

export async function banUser(adminUser: User, ban: BanDto) {
  if (adminUser.role !== "ADMIN") {
    throw new Error("Not admin");
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      id: ban.userId,
    },
  });

  if (existingUser?.isBanned || !existingUser) {
    throw new Error("User is already banned or does not exist");
  }

  await prisma.bannedUsers.create({
    data: {
      email: existingUser?.email,
    },
  });

  await prisma.user.update({
    where: {
      id: ban.userId,
    },
    data: {
      isBanned: true,
      banExpirationDate: ban.banExpartionDate
        ? new Date(ban.banExpartionDate)
        : undefined,
    },
  });

  //send email to user

  return "User banned";
}

export async function unbanUser(adminUser: User, userId: UUID) {
  if (adminUser.role !== "ADMIN") {
    throw new Error("Not admin");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user?.isBanned || !user) {
    throw new Error("User is not banned or does not exist");
  }

  await prisma.bannedUsers.delete({
    where:{
      email:user.email
    }
  });

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      isBanned: false,
      banExpirationDate: null,
    },
  });

  //send email to user

  return "User unbanned";
}



export async function patchUser(adminUser: User, patchUser: PatchUserDto) {
  if (adminUser.role !== "ADMIN") {
    throw new Error("Not admin");
  }

  const { id, ...updateData } = patchUser;

  await prisma.user.update({
    where: {
      id: id,
    },
    data: updateData,
  });
}

