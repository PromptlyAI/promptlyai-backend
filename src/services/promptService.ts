import {
  Configuration,
  CreateChatCompletionResponseChoicesInner,
  OpenAIApi,
} from "openai";
import { PrismaClient, Prompt, User } from "@prisma/client";
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const basePrompt = process.env.BASE_PROMPT;

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

export const getImprovedPrompt = async (prompt: string, user: User) => {
  const response = await fetchImprovedPrompt(prompt);
  const tokenCost = calculateTokenCost(response.data.choices);
  if (user.totalTokenBalance < tokenCost)
    throw new Error("Not enough token balance!");

  await prisma.user.update({
    where: { id: user.id },
    data: { totalTokenBalance: { decrement: tokenCost } },
  });

  const output = cleanPrompt(response.data.choices[0].message?.content || "");

  const newPrompt = await prisma.prompt.create({
    data: {
      input: prompt,
      output: output,
      model: "gpt-3.5-turbo",
      tokenCost: `${tokenCost}`,
      userId: user.id,
    },
  });

  return { response: response.data.choices, prompt: newPrompt };
};

function cleanPrompt(originalOutput: string) {
  const promptSplit: string[] = originalOutput.split(":");
  let output = promptSplit[promptSplit.length - 1];
  if (output[0] === " ") {
    output.slice(1);
  }
  return output;
}

async function fetchImprovedPrompt(prompt: string) {
  const formattedPrompt = `${basePrompt}${prompt}`;
  return await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        content: formattedPrompt,
        role: "user",
      },
    ],
  });
}

export const getImprovedResult = async (
  prompt: string,
  user: User,
  promptId: string
) => {
  const promptRecord = await prisma.prompt.findUnique({
    where: { id: promptId },
  });

  if (!promptRecord) throw new Error("Prompt not found");
  if (user.id !== promptRecord.userId) throw new Error("Not correct user!");

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        content: prompt,
        role: "user",
      },
    ],
  });
  const tokenCost = calculateTokenCost(response.data.choices);
  if (user.totalTokenBalance < tokenCost)
    throw new Error("Not enough token balance!");

  const promptAnswer = await prisma.promptAnswer.create({
    data: {
      modell: "gpt-3.5-turbo",
      output: response.data.choices[0].message?.content || "",
      tokenCost: `${tokenCost}`,
      promptId: promptId,
    },
  });

  return { response: response.data.choices[0].message, promptAnswer };
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

  return prompts.map((prompt) => {
    return {
      id: prompt.id,
      input: prompt.input,
    };
  });
};

export const getPromptInfo = async (user: User, promptId: string) => {
  const prompt = await prisma.prompt.findFirst({
    where: {
      id: promptId,
    },
    include: {
      promptAnswer: {
        select: {
          id: true,
          promptId: true,
          modell: true,
          output: true,
          tokenCost: true,
        },
        take: 1,
      },
    },
  });

  if (!prompt || prompt.userId !== user.id) throw new Error("Wrong prompt id");

  return prompt;
};

