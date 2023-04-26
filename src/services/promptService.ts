import {
  Configuration,
  CreateChatCompletionResponseChoicesInner,
  OpenAIApi,
} from 'openai'
import { PrismaClient, Prompt, Type, User } from '@prisma/client'
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const BasePrompt = process.env.BASE_PROMPT
const BaseImagePrompt = process.env.BASE_IMAGE_PROMPT
const TextEnhancePrompt = process.env.TEXT_ENHANCE_PROMPT
const prisma = new PrismaClient({ log: ['query', 'error'] })
const openai = new OpenAIApi(configuration)

const calculateTokenCost = (
  messages: CreateChatCompletionResponseChoicesInner[],
): number => {
  let num_tokens = 0

  messages.forEach((message) => {
    if (message.message) {
      num_tokens += message.message.content.split(' ').length
    }
  })

  return num_tokens
}

export const getImprovedPrompt = async (prompt: string, user: User) => {
  const response = await fetchImprovedPrompt(`${BasePrompt}${prompt}`)
  const tokenCost = calculateTokenCost(response.data.choices)
  if (user.totalTokenBalance < tokenCost)
    throw new Error('Not enough token balance!')

  await prisma.user.update({
    where: { id: user.id },
    data: { totalTokenBalance: { decrement: tokenCost } },
  })

  const output = cleanPrompt(response.data.choices[0].message?.content || '')

  const newPrompt = await prisma.prompt.create({
    data: {
      input: prompt,
      output: output,
      model: 'gpt-3.5-turbo',
      tokenCost: `${tokenCost}`,
      userId: user.id,
    },
  })

  return { response: response.data.choices, prompt: newPrompt }
}

export const enhanceText = async (
  promptId: string,
  part: string,
  instructions: string,
  user: User,
) => {
  //leave instructions empty if you don't want them
  const prompt = await prisma.prompt.findFirst({
    where: {
      id: promptId,
    },
  })

  if(part === undefined) {
    part = "whole text";
  }

  const input = `${TextEnhancePrompt} Main prompt: ${prompt?.output} Part to enhance: ${part} Instructions: ${instructions}`;

  const response = await fetchImprovedPrompt(input);

  const tokenCost = calculateTokenCost(response.data.choices)
  if (user.totalTokenBalance < tokenCost)
    throw new Error('Not enough token balance!');

  await prisma.user.update({
    where: { id: user.id },
    data: { totalTokenBalance: { decrement: tokenCost } },
  })
  //Important to fix new baseprompt
  const outputPrompt = cleanPrompt(
    response.data.choices[0].message?.content || '',
  )

  await prisma.prompt.update({
    where: { id: promptId },
    data: { output: outputPrompt },
  })

  return { output : outputPrompt }
}

export const getImprovedImagePrompt = async (prompt: string, user: User) => {
  const response = await fetchImprovedPrompt(`${BaseImagePrompt}${prompt}`)
  const tokenCost = calculateTokenCost(response.data.choices)
  if (user.totalTokenBalance < tokenCost)
    throw new Error('Not enough token balance!')

  await prisma.user.update({
    where: { id: user.id },
    data: { totalTokenBalance: { decrement: tokenCost } },
  })

  const output = cleanPrompt(response.data.choices[0].message?.content || '')

  const newPrompt = await prisma.prompt.create({
    data: {
      input: prompt,
      output: output,
      model: 'gpt-3.5-turbo',
      type: Type.TEXT,
      tokenCost: `${tokenCost}`,
      userId: user.id,
    },
  })

  return { response: response.data.choices, prompt: newPrompt }
}

function cleanPrompt(originalOutput: string) {
  const promptSplit: string[] = originalOutput.split('"')
  let output = promptSplit[1]
  return output
}

async function fetchImprovedPrompt(formattedPrompt: string) {
  return await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        content: formattedPrompt,
        role: 'user',
      },
    ],
  })
}

export const getImprovedResult = async (
  prompt: string,
  user: User,
  promptId: string,
) => {
  const promptRecord = await prisma.prompt.findUnique({
    where: { id: promptId },
  })

  if (!promptRecord) throw new Error('Prompt not found')
  if (user.id !== promptRecord.userId) throw new Error('Not correct user!')

  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        content: prompt,
        role: 'user',
      },
    ],
  })
  const tokenCost = calculateTokenCost(response.data.choices)
  if (user.totalTokenBalance < tokenCost)
    throw new Error('Not enough token balance!')

  await prisma.user.update({
    where: { id: user.id },
    data: { totalTokenBalance: { decrement: tokenCost } },
  })

  const promptAnswer = await prisma.promptAnswer.create({
    data: {
      modell: 'gpt-3.5-turbo',
      output: response.data.choices[0].message?.content || '',
      tokenCost: `${tokenCost}`,
      promptId: promptId,
    },
  })

  return { response: response.data.choices[0].message, promptAnswer }
}

export const getImprovedImage = async (
  prompt: string,
  user: User,
  promptId: string,
) => {
  const promptRecord = await prisma.prompt.findUnique({
    where: { id: promptId },
  })

  if (!promptRecord) throw new Error('Prompt not found')
  if (user.id !== promptRecord.userId) throw new Error('Not correct user!')

  const response = await openai.createImage({
    prompt: prompt,
    n: 1,
    size: '1024x1024',
  })
  const image_url = response.data.data[0].url
  const tokenCost = 1
  if (user.totalImageBalance < tokenCost)
    throw new Error('Not enough token balance!')

  await prisma.user.update({
    where: { id: user.id },
    data: { totalImageBalance: { decrement: tokenCost } },
  })
  const promptAnswer = await prisma.promptAnswer.create({
    data: {
      modell: 'dalle',
      output: image_url || '',
      tokenCost: `${tokenCost}`,
      promptId: promptId,
    },
  })

  return { image_url, promptAnswer }
}

export const deletePrompt = async (user: User, promptId: string) => {
  const promptToDelete = await prisma.prompt.findUnique({
    where: {
      id: promptId,
    },
  })

  if (!promptToDelete) {
    throw new Error('Prompt not found')
  }

  if (promptToDelete.userId !== user.id) {
    throw new Error('Not correct user')
  }

  // Delete related PromptAnswer records before deleting the Prompt
  await prisma.promptAnswer.deleteMany({
    where: {
      promptId: promptToDelete.id,
    },
  })

  await prisma.prompt.delete({
    where: {
      id: promptToDelete.id,
    },
  })
}

export const deleteAllMyPrompts = async (user: User) => {
  // First, delete all related PromptAnswer records
  await prisma.promptAnswer.deleteMany({
    where: {
      prompt: {
        userId: user.id,
      },
    },
  })

  // Then, delete all the Prompt records for the user
  await prisma.prompt.deleteMany({
    where: {
      userId: user.id,
    },
  })
}

export const getAllPrompts = async (user: User) => {
  const prompts = await prisma.prompt.findMany({
    where: {
      userId: user.id,
    },
    include: {
      promptAnswer: true,
    },
  })

  return prompts.map((prompt) => {
    return {
      id: prompt.id,
      input: prompt.input,
    }
  })
}

export const getPromptInfo = async (user: User, promptId: string) => {
  const prompt = await prisma.prompt.findFirst({
    where: {
      id: promptId,
    },
    include: {
      promptAnswer: true,
    },
  })

  if (!prompt || prompt.userId !== user.id) throw new Error('Wrong prompt id')

  return {
    input: prompt?.input || '',
    output: prompt?.output || '',
    answer: prompt.promptAnswer[0]?.output || '',
  }
}
