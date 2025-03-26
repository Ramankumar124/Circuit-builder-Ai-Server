import { GoogleGenerativeAI } from "@google/generative-ai";
import {properties} from "../config/properties.js"
import {systemPrompt} from "../prompt/systemPrompt.js"


const GEMINI_API_KEY = properties?.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function generateCircuit(userPrompt, systemPrompt) {
  try {
    const result = await model.generateContent([systemPrompt, userPrompt]);
    return result.response.text()
  } catch (error) {
    throw error
  }
}

export default generateCircuit;
// import OpenAI from "openai";
// import { properties } from "../config/properties.js";
// import { systemPrompt } from "../prompt/systemPrompt.js";

// const DEEPSEEK_API_KEY = properties?.DEEPSEEK_API_KEY;

// const openai = new OpenAI({
//   apiKey: DEEPSEEK_API_KEY,
//       baseURL: 'https://api.deepseek.com'
// });

// async function generateCircuit(userPrompt) {
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