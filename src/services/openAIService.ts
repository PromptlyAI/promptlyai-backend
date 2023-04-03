import { Configuration, OpenAIApi } from "openai"
import { PrismaClient } from "@prisma/client";
import constants from "../constants/constants";
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const prisma = new PrismaClient({ log: ["query", "error"] });

const openai = new OpenAIApi(configuration);



export const getImprovedPrompt = async (prompt: string, userId: string) => {
    const formattedPrompt = `${constants.basePrompt}${prompt}`;
    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{
            content: formattedPrompt,
            role: "user"
        }]
    })

    const newPrompt = await prisma.prompt.create({
        data: {
            input: prompt,
            output: response.data.choices[0].message?.content || "",
            model: "gpt-3.5-turbo",
            tokenCost: "0",
            userId
        }
    })

    return { response: response.data.choices, prompt: newPrompt };
}

export const getImprovedResult = async (prompt: string, userId: string, promptId: string) => {
    const promptRecord = await prisma.prompt.findUnique({ where: { id: promptId } })

    if (!promptRecord) throw new Error("Prompt not found");

    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{
            content: prompt,
            role: "user"
        }]
    });

    try {
        const promptAnswer = await prisma.promptAnswer.create({
            data: {
                modell: "gpt-3.5-turbo",
                output: response.data.choices[0].message?.content || "",
                tokenCost: "0",
                promptId: promptId,
            }
        })

        return { response: response.data.choices[0].message, promptAnswer };
    } catch (error) {
        console.log(error)
        throw new Error(error as string);
    }

}


export const getAllPrompts = async (userId: string) => {
    const prompts = await prisma.prompt.findMany({
        where: {
            userId
        },
        include: {
            profile: true
        },
    })

    return prompts;
}