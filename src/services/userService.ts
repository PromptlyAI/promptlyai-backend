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

export async function forgotPassword(email: string) {
  const data = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  const token = createResetToken();
  /*
    data.ResetToken = token;
    data.ResetTokenExpirationDate = DateTime.Now.AddDays(1);

    mailService.send(token);
  */
  
}

async function createResetToken() {
  let token: string = "";
  let exists: boolean = true;

  while (exists) {
    token = randomUUID();
    /*
    const data = await prisma.user.findUnique({
      where: {
        resetToken: token,
      },
    });
    
    if (data !== null)
      exists = true;
    else exists = false;
    break;
    */
  }

  return token;
}
