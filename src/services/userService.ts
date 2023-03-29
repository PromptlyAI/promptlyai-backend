import jwt from "jsonwebtoken";
import Bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { RegisterDto, UserDto } from "../interfaces/UserDtos";
import dotenv from "dotenv";
import { randomUUID } from "crypto";

dotenv.config();
const tokenSecret = process.env.TOKEN_SECRET;
const prisma = new PrismaClient();

export async function register(user: RegisterDto) {
  const passhash = Bcrypt.hashSync(user.password, 10);
  await prisma.user.create({
    data: {
      name: user.name,
      email: user.email,
      passwordhash: passhash,
    },
  });
}

export async function login(user: UserDto) {
  const data = await prisma.user.findUnique({
    where: {
      email: user.email,
    },
  });

  if (data === null) {
    throw new Error("Illa");
  } else {
    const validPassword = await Bcrypt.compare(
      user.password,
      data.passwordhash
    );
    if (!validPassword) throw new Error("Invalid password");

    const token = jwt.sign(
      {
        _id: data.id,
      },
      tokenSecret || "",
      {
        expiresIn: 129600,
      }
    );

    return token;
  }
}

export async function deleteUser(userId: string) {
  const data = await prisma.user.delete({
    where: {
      id: userId,
    },
  });
}

export async function forgotPassword(email: string): Promise<string> {
  const token = await createResetToken();
  
  await prisma.user.update({
    where: {
      email: email,
    },
    data: {
      resetToken: token,
      resetTokenExpirationDate: new Date(Date.now() + 86400000),
    },
  });

  //mailService.send(token);
  return token;
}

export async function resetPassword(
  resetToken: string,
  newPassword: string
){
  const user = await prisma.user.findFirst({
    where: {
      resetToken: resetToken,
    },
  });

  if (!user || !user.resetTokenExpirationDate) {
    throw new Error("Illa");
  }

  const now = new Date();
  const expirationDate = new Date(user.resetTokenExpirationDate);

  if (now > expirationDate) {
    throw new Error("Illa");
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      passwordhash: Bcrypt.hashSync(newPassword, 10),
      resetToken: null,
      resetTokenExpirationDate: null,
    },
  });

}

async function createResetToken() {
  let token: string = "";
  let exists: boolean = true;

  while (exists) {
    token = randomUUID();

    const data = await prisma.user.findFirst({
      where: {
        resetToken: {
          equals: token,
        },
      },
    });

    if (data) exists = true;
    else exists = false;
    break;
  }

  return token;
}
