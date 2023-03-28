import jwt from "jsonwebtoken";
import Bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { RegisterDto, UserDto } from "../interfaces/UserDtos";
import dotenv from 'dotenv';

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
    const data = await prisma.user.findUnique({where: {
        email: user.email
    }});

    if(data === null) {
        throw new Error("Illa");
    }else{
        const validPassword = await Bcrypt.compare(user.password, data.passwordhash);
        if(!validPassword) throw new Error("Invalid password");
        
        const token = jwt.sign({_id: data.id}, tokenSecret || "");
        
        return token;
    }
}
