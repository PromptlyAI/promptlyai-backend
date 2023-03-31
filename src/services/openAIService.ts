import { Configuration, OpenAIApi } from "openai"
import { PrismaClient } from "@prisma/client";
import constants from "../constants/constants";
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const prisma = new PrismaClient();

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

export const getImprovedResult = async (prompt: string, userId: string) => {
    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{
            content: prompt,
            role: "user"
        }]
    })


    return response.data.choices[0].message;
}
