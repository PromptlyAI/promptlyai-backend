import { Configuration, CreateChatCompletionResponseChoicesInner, OpenAIApi } from "openai"
import { PrismaClient } from "@prisma/client";
import constants from "../constants/constants";
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const prisma = new PrismaClient();

const openai = new OpenAIApi(configuration);

const calcualteTokenCost = (messages: CreateChatCompletionResponseChoicesInner[]): number => {
  let num_tokens = 0;

    messages.forEach((message) => {
        if (message.message) {
            num_tokens += message.message.content.split(" ").length;
        }
        
    })

    return num_tokens;
}

export const getImprovedPrompt = async (prompt: string, userId: string) => {
    const formattedPrompt = `${constants.basePrompt}${prompt}`;
    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{
            content: formattedPrompt,
            role: "user"
        }]
    })
    const tokenCost = calcualteTokenCost(response.data.choices);

    const user = await prisma.user.findFirst({where: {id: userId}});
 
   if(user) { 
       await prisma.user.update({where: {id: user.id}, data: {totalTokenBalance: {decrement: tokenCost}}});
       const newPrompt = await prisma.prompt.create({
            data: {
                input: prompt,
                output: response.data.choices[0].message?.content || "",
                model: "gpt-3.5-turbo",
                tokenCost: `${tokenCost}`,
                userId: user.id,
            }
        });
    return { response: response.data.choices, prompt: newPrompt };
   }

}

export const getImprovedResult = async (prompt: string, userId: string) => {
    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{
            content: prompt,
            role: "user"
        }]
    })

    const tokenCost = calcualteTokenCost(response.data.choices);

    const user = await prisma.user.findFirst({where: {id: userId}});


    return response.data.choices[0].message;
}
