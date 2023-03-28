import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client'
import userController from './src/controllers/userController';

const prisma = new PrismaClient()

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.get('/', (req: Request, res: Response) => {
  res.send('Slaktar Server');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

app.use("/user", userController);

async function main() {
  // ... you will write your Prisma Client queries here
  await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@prisma.io',
      passwordhash: 'slak'
    },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })


  