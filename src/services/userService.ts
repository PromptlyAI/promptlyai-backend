import jwt from "jsonwebtoken";
import Bcrypt from "bcrypt";
import { PrismaClient, User } from "@prisma/client";
import { RegisterDto, UserDto } from "../interfaces/UserDtos";
import dotenv from "dotenv";
import { randomUUID } from "crypto";
import { MailDto } from "../interfaces/MailDto";
import e from "express";
import { cwd } from "process";
import sgMail from '@sendgrid/mail'
import { sendResetPassword, sendVerifyEmail } from "./mailService";


dotenv.config();
const tokenSecret = process.env.TOKEN_SECRET;
const prisma = new PrismaClient();

export async function register(user: RegisterDto) {
  checkBanList(user.name, user.email);
  checkEmailAdress(user.email);
  const verifyToken = await createVerifyToken()
  const passhash = Bcrypt.hashSync(user.password, 10);
  await prisma.user.create({
    data: {
      name: user.name,
      email: user.email,
      passwordhash: passhash,
      verifyToken,
    },
  });
  await sendVerifyEmail({ to: user.email, token: verifyToken, body: "Verify your account" })
}

export async function resendVerification(email:string) {
  const verifyToken = await createVerifyToken()
  await prisma.user.update({
    where:{
      email
    },
    data: {
      verifyToken
    },
  });
  await sendVerifyEmail({ to: email, token: verifyToken, body: "Verify your account" })
}

function checkEmailAdress(email: string) {
  const emailRegex = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}(\.[a-zA-Z]{2,6}){0,1})$/;
  if (!emailRegex.test(email)) {
    throw new Error("Not correct email");
  }
}


export async function login(user: UserDto) {
  const data = await prisma.user.findUnique({
    where: {
      email: user.email,
    },
  });

  if (data === null) {
    throw new Error("user not found");
  } else {
    const validPassword = await Bcrypt.compare(
      user.password,
      data.passwordhash
    );
    if (!validPassword) throw new Error("Invalid password");

    const token = jwt.sign(
      {
        id: data.id,
      },
      tokenSecret || "",
      {
        expiresIn: 129600,
      }
    );

    return { token: token };
  }
}

export async function deleteUser(user: User) {
  const data = await prisma.user.delete({
    where: {
      id: user.id,
    },
  });
}

export async function forgotPassword(email: string) {
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

  sendResetPassword({ to: email, token: token, body: "Reset password" });
}

export async function resetPassword(resetToken: string, newPassword: string) {
  const user = await prisma.user.findFirst({
    where: {
      resetToken: resetToken,
    },
  });

  if (!user || !user.resetTokenExpirationDate) {
    throw new Error("invalid user");
  }

  const now = new Date();
  const expirationDate = new Date(user.resetTokenExpirationDate);

  if (now > expirationDate) {
    throw new Error("token expired");
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

async function createVerifyToken() {
  let token: string = "";
  let exists: boolean = true;

  while (exists) {
    token = randomUUID();

    const data = await prisma.user.findFirst({
      where: {
        verifyToken: {
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

async function checkBanList(name: string, email: string) {
  const data = await prisma.bannedUsers.findMany({
    where: {
      name: name,
      email: email,
    },
  });

  if (data.length > 0) {
    throw new Error("User is banned");
  }
}

export async function verifyAccount(token: string) {
  try {
    await prisma.user.updateMany({ where: { verifyToken: token }, data: { isVerified: true } });
  } catch (error) {
    return false;
  }
  return true;
}
