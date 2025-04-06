import { GoogleGenerativeAI } from "@google/generative-ai";


const GEMINI_API_KEY = process.env?.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function generateCircuit(userPrompt:string, systemPrompt:string) {
  try {
    const result = await model.generateContent([systemPrompt, userPrompt]);
    return result.response.text()
  } catch (error) {
    throw error
  }
}

export default generateCircuit;
// import OpenAI from "openai";

// const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// const openai = new OpenAI({
//   apiKey: DEEPSEEK_API_KEY,
//       baseURL: 'https://api.deepseek.com'
// });

// async function generateCircuit(userPrompt:string,systemPrompt:string) {
//   try {
//     const response = await openai.chat.completions.create({
//       model: "deepseek-chat", // Replace with the actual DeepSeek model name
//       messages: [
//         { role: "system", content: systemPrompt },
//         { role: "user", content: userPrompt },
//       ],
//     temperature:0,
//     });
//      console.log(response);
//      console.log(response.choices[0].message.content);
     
//     return response.choices[0].message.content;
//   } catch (error) {
//     throw error;
//   }
// }

// export default generateCircuit;