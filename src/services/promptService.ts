import {
  Configuration,
  CreateChatCompletionResponseChoicesInner,
  OpenAIApi,
} from "openai";
import { PrismaClient, Prompt, User } from "@prisma/client";
import constants from "../constants/constants";
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const prisma = new PrismaClient({ log: ["query", "error"] });

const openai = new OpenAIApi(configuration);

const calculateTokenCost = (
  messages: CreateChatCompletionResponseChoicesInner[]
): number => {
  let num_tokens = 0;

  messages.forEach((message) => {
    if (message.message) {
      num_tokens += message.message.content.split(" ").length;
    }
  });

  return num_tokens;
};

export const getImprovedPrompt = async (prompt: string, user: User,  ) => {
  const formattedPrompt = `${constants.basePrompt}${prompt}`;
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        content: formattedPrompt,
        role: "user",
      },
    ],
  });
  const tokenCost = calculateTokenCost(response.data.choices);

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { totalTokenBalance: { decrement: tokenCost } },
    });
    const newPrompt = await prisma.prompt.create({
      data: {
        input: prompt,
        output: response.data.choices[0].message?.content || "",
        model: "gpt-3.5-turbo",
        tokenCost: `${tokenCost}`,
        userId: user.id,
      },
    });
    return { response: response.data.choices, prompt: newPrompt };
  }
};

export const getImprovedResult = async (
  prompt: string,
  user: User,
  promptId: string
) => {
  const promptRecord = await prisma.prompt.findUnique({
    where: { id: promptId },
  });

  if (!promptRecord) throw new Error("Prompt not found");

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        content: prompt,
        role: "user",
      },
    ],
  });

  try {
    const promptAnswer = await prisma.promptAnswer.create({
      data: {
        modell: "gpt-3.5-turbo",
        output: response.data.choices[0].message?.content || "",
        tokenCost: `${calculateTokenCost(response.data.choices)}`,
        promptId: promptId,
      },
    });

    return { response: response.data.choices[0].message, promptAnswer };
  } catch (error) {
    console.log(error);
    throw new Error(error as string);
  }
};

export const deletePrompt = async (user: User, promptId: string) => {
  const promptToDelete = await prisma.prompt.findUnique({
    where: {
      id: promptId,
    },
  });

  if (!promptToDelete) {
    throw new Error("Prompt not found");
  }

  if (promptToDelete.userId !== user.id) {
    throw new Error("Not correct user");
  }

  await prisma.prompt.delete({
    where: {
      id: promptToDelete.id,
    },
  });
};
export const getAllPrompts = async (user: User) => {
  const prompts = await prisma.prompt.findMany({
    where: {
      userId: user.id,
    },
    include: {
      promptAnswer: true,
    },
  });

  return prompts;
};
