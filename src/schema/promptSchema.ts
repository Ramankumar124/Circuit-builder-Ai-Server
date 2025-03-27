import {z} from "zod"
export const promptSchema=z.object({
    prompt:z.string({required_error:"prompt is requried"})
    .min(20,"Prompt must be a long")
})