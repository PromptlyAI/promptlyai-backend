import { Configuration, OpenAIApi } from "openai"
import constants from "../constants/constants";
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);



export const getImprovedPrompt = async (prompt: string) => {
    const formattedPrompt = `${constants.basePrompt}${prompt}`;
    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{
            content: formattedPrompt,
            role: "user"
        }]
    })

    return response.data.choices;
}

