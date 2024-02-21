import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ['query', 'error'] })

export const fetchNewPrompt = async (task:string, trainingData:string) => {


    throw new Error('Not implemented yet')

    const apiKey = process.env.PROMPTGRAD_API_KEY;

    //fetch the prompt from the promptgrad api
    const output = ""
    const newPrompt = await prisma.promptGradPrompt.create({
        data: {
            task,
            trainingData,
            output
        },
      });
    

}