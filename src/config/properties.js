import dotenv from "dotenv"
dotenv.config();
export const properties = {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECERT_KEY: process.env.JWT_SECERT_KEY,
    PORT: process.env.PORT,
    SALT_ROUND: process.env.SALT_ROUND,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    DEEPSEEK_API_KEY:process.env.DEEPSEEK_API_KEY
}