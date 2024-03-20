import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ['query', 'error'] })

const parseCsvToJson = (csv:string) => {
    const lines: string[] = csv.split(';')
    

    const json: TrainingData[] = lines.map((item, index): TrainingData =>{
        
        const data : TrainingData =  {
            Question : item.split(',')[0],
            Answer : item.split(',')[1],
        }

        return data

    });

    return json;
}

export const fetchNewPrompt = async (task:string, trainingData:string) => {

    throw new Error("Step")

    const apiKey = process.env.PROMPTGRAD_API_KEY;

    const jsonData = parseCsvToJson(trainingData);


    //fetch the prompt from the promptgrad api

    const result =  await fetch("/MrMusk-api.com/slakt",
    {
        method: "POST",
        body: JSON.stringify(jsonData)
    })
    .then(function(res){ console.log(res); return res; })
    .catch(function(res){ console.log(res) })



    const output = (result as any).output;

    const newPrompt = await prisma.promptGradPrompt.create({
        data: {
            task,
            trainingData : JSON.stringify(jsonData),
            output
        },
      });

      return output;
    

}

