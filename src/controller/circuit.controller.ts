import Circuit from "../../../model/circuit.js";
import Project from "../../../model/project.js";
import { handleError, handleGeminiError } from "../../../utils/handleError.js";
import generateCircuit from "../../../utils/ai-agent.js";
import {
  systemPrompt,
  enhanceSystemPrompt,
} from "../../src/prompt/systemPrompt.js";
import { asyncHandler } from "../utils/Asynchandler.js";
import { NextFunction, Request, Response } from "express";
import { promptSchema } from "../schema/promptSchema.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

//  Create a new circuit
export const createCircuit = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { prompt } = promptSchema.parse(req.body);
  if(!prompt) return next(new ApiError(400,"User must enter the prompt"))
  const circuit = await generateCircuit(prompt, systemPrompt);
  res.status(201).json(new ApiResponse(201, circuit, "circuit Created"));
});

//  Get all circuits
export const getAllCircuits =asyncHandler(async function (
    req:Request,
    res:Response,
    next:NextFunction
){
    const { projectId } = req.params;
    if(!projectId) return  next(new ApiError(400,"Get circuit"));
    const circuits = await Circuit.find({ projectId }).populate(
      "projectId",
      "projectName"
    );
    res.status(200).send({ data: circuits });

});

// Update a circuit
export const updateCircuit = async (req, res) => {
  try {
    const { prompt } = req.body;
    const { id } = req.params;

    const circuit = await generateCircuit(prompt);
    const updatedCircuit = await Circuit.findByIdAndUpdate(
      { id },
      { prompt, circuit },
      { new: true }
    );

    if (!updatedCircuit)
      return res
        .status(404)
        .json({ success: false, message: "Circuit not found" });

    res
      .status(200)
      .send({ message: "Circuit updated", circuit: updatedCircuit });
  } catch (error) {
    handleError(error, res);
  }
};

export const saveProjectCircuit = async (req, res) => {
  try {
    const { projectName, prompt, circuit, userId } = req.body;

    const project = new Project({ projectName, userId });
    await project.save();

    const newCircuit = new Circuit({
      prompt,
      circuit,
      projectId: project?._id,
    });
    await newCircuit.save();
    const payload = {
      ...project,
      ...newCircuit,
      circuitId: newCircuit?._id,
      projectId: project?._id,
    };
    return res
      .status(200)
      .send({ message: "Project created successfully", data: payload });
  } catch (error) {
    handleError(error, res);
  }
};

export const enhancePrompt = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) return res.status(400).send({ message: "Enter prompt" });

    const enhacedPrompt = await generateCircuit(prompt, enhanceSystemPrompt);

    res.status(201).send({
      message: "Enhanced prompt generated successfully.",
      data: enhacedPrompt,
    });
    console.log(enhacedPrompt);
  } catch (error) {
    handleGeminiError(error, res);
  }
};
