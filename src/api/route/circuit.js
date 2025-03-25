import { createCircuit,getAllCircuits, saveProjectCircuit,enhancePrompt } from "../service/circuit/circuit.js";
import { Router } from "express";
import { protectRoute } from "../middleware/protectRoute.js";


export const circuitRoute = Router();

circuitRoute.post("/circuit", createCircuit);
circuitRoute.get("/circuits/:projectId",protectRoute, getAllCircuits);
circuitRoute.post("/save-circuit",protectRoute, saveProjectCircuit);
circuitRoute.post("/enhance-prompt", enhancePrompt)