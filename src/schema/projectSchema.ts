import {z} from "zod"
export const createProjectSchema = z.object({
    circuitName: z.string({ required_error: "Circuit Name is required" })
        .max(100, "Circuit Name must not exceed 100 characters"),
    node: z.any({ required_error: "Node is required" }),
    edges: z.any({ required_error: "Edges are required" }),
    suggestions: z.string({ required_error: "Suggestions are required" })
        .max(500, "Suggestions must not exceed 500 characters"),
    explaination: z.string({ required_error: "Explanation is required" })
        .max(500, "Explanation must not exceed 500 characters")
});

export const projectShareSchema= z.object({
    projectId: z.string({"required_error":"project id is required"}),
  });