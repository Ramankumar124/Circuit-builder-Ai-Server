
import generateCircuit from "../service/aiAgent.service";
import {
  systemPrompt,
  enhanceSystemPrompt,
  getComponentDetailsPrompt,
  correctCircuitPrompt,
} from "../prompt/systemPrompt";
import { asyncHandler } from "../utils/Asynchandler";
import { NextFunction, Request, Response } from "express";
import { promptSchema } from "../schema/promptSchema";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";

//  Create a new circuit
export const createCircuit = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { prompt } = promptSchema.parse(req.body);
  if (!prompt) return next(new ApiError(400, "User must enter the prompt"));
  const circuit = await generateCircuit(prompt, systemPrompt);
// console.log(circuit);

//   const correctCircuit=await generateCircuit(circuit,correctCircuitPrompt);
//   console.log(correctCircuit);
  
  res.status(201).json(new ApiResponse(201, circuit, "circuit Created"));
});


export const enhancePrompt = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
      const { prompt } = req.body;

      if (!prompt) return next(new ApiError(400,"Prompt must not be Empty")) 

      const enhacedPrompt = await generateCircuit(prompt, enhanceSystemPrompt);

       res
          .status(201)
          .json(new ApiResponse(201,enhacedPrompt,"Enhanced prompt generated successfully."))
      
  }
);

export const getComponentDetails=asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    
    const {componentId}=req.body;
    
    if (!componentId) return next(new ApiError(400,"Component name must not be Empty")) ;
    const compData = await generateCircuit(componentId,getComponentDetailsPrompt);
    
    return res
      .status(201)
      .json(new ApiResponse(201,compData,"Component detaiss sended successfuly"));

  }
)