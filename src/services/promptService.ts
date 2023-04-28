import {
  Configuration,
  CreateChatCompletionResponseChoicesInner,
  OpenAIApi,
} from 'openai'
import { PrismaClient, Prompt, Type, User } from '@prisma/client'
import fs from 'fs'
import AWS from 'aws-sdk'


AWS.config.loadFromPath("./config.json")
// Create S3 service object
var s3 = new AWS.S3({ params: { bucket: "slaktar-bucket" } });

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

export const createNewPrompt = async (user: User, type:Type) => {
  const newPrompt = await prisma.prompt.create({
    data: {
      model: 'gpt-3.5-turbo',
      tokenCost: `0`,
      userId: user.id,
      type
    },
  });

  return { prompt: newPrompt }
}

export const getImprovedPrompt = async (input: string, promptId:string,  user: User) => {
  const response = await fetchImprovedPrompt(`${BasePrompt}${input}`)
  const tokenCost = calculateTokenCost(response.data.choices)
  if (user.totalTokenBalance < tokenCost)
    throw new Error('Not enough token balance!')

  await prisma.user.update({
    where: { id: user.id },
    data: { totalTokenBalance: { decrement: tokenCost } },
  })

  const output = cleanPrompt(response.data.choices[0].message?.content || '')
  const prompt = await prisma.prompt.findFirst({where:{id:promptId}})
  if(prompt?.userId !== user.id || !prompt){
    throw new Error("Could not access prompt");
  }

  const updatedPrompt = await prisma.prompt.update({
    where: { id: promptId },
    data: {
      input,
      output: output,
      model: 'gpt-3.5-turbo',
      tokenCost: `${tokenCost}`,
      userId: user.id,
    },
  })


  return { response: response.data.choices, prompt: updatedPrompt }
}

export const enhanceText = async (
  promptId: string,
  part: string,
  instructions: string,
  user: User,
) => {
  //leave instructions empty if you don't want them
  //TODO: fix for new prompt system
  const prompt = await prisma.prompt.findFirst({
    where: {
      id: promptId,
    },
  })

  if (part === undefined) {
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
  const outputPrompt = cleanPrompt(response.data.choices[0].message?.content || 'No output found');

  await prisma.prompt.update({
    where: { id: promptId },
    data: { output: outputPrompt },
  })

  return { output: outputPrompt }
}

export const getImprovedImagePrompt = async (input: string,promptId:string, user: User) => {
  const response = await fetchImprovedPrompt(`${BaseImagePrompt}${input}`)
  const tokenCost = calculateTokenCost(response.data.choices)
  if (user.totalTokenBalance < tokenCost)
    throw new Error('Not enough token balance!')

  await prisma.user.update({
    where: { id: user.id },
    data: { totalTokenBalance: { decrement: tokenCost } },
  })

  const output = cleanPrompt(response.data.choices[0].message?.content || '')

  const prompt = await prisma.prompt.findFirst({where:{id:promptId}})
  if(prompt?.userId !== user.id || !prompt){
    throw new Error("Could not access prompt");
  }

  const updatedPrompt = await prisma.prompt.update({
    where: { id: promptId },
    data: {
      input,
      output: output,
      model: 'gpt-3.5-turbo',
      tokenCost: `${tokenCost}`,
      userId: user.id,
    },
  })

  return { response: response.data.choices, prompt: updatedPrompt }
}

function cleanPrompt(originalOutput: string) {
  const promptSplit: string[] = originalOutput.split('"');
  let output = promptSplit[1];

  if (!output) {
    output = 'No output found'; // Set a default value when the extracted output is empty
  }

  return output;
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
    response_format: "b64_json"
  })
  const b64_json = response.data.data[0].b64_json

  const buffer = Buffer.from(b64_json as string, 'base64');

  const data = {
    Key: `${promptId}.png`,
    Body: buffer,
    ContentEncoding: 'base64',
    ContentType: 'image/png',
    Bucket: 'slaktar-bucket'
  }
  const imageUrl = "https://slaktar-bucket.s3.eu-north-1.amazonaws.com/" + promptId + ".png"
  s3.putObject(data, function (err, data) {
    if (err) {
      console.log(err);
      console.log('Error uploading data: ', data);
    } else {
      console.log(data);
    }
  });



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
      output: imageUrl,
      tokenCost: `${tokenCost}`,
      promptId: promptId,
    },
  })

  return { image_url: imageUrl, promptAnswer }
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


export const getAllPrompts = async (user: User, type?: Type) => {
  const prompts = await prisma.prompt.findMany({
    where: {
      userId: user.id,
      type
    },
    include: {
      promptAnswer: true,
    },
  })

  return prompts.map((prompt) => {
    return {
      id: prompt.id,
      input: prompt.input,
      type: prompt.type,
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
    input: prompt.input,
    type: prompt.type,
    output: prompt.output,
    answer: prompt.promptAnswer[0]?.output || '',
  }
}
