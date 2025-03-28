import { createCircuit, enhancePrompt } from "../controller/circuit.controller";
import { Router } from "express";

const router = Router();

router.route("/create-circuit").post(createCircuit);
router.route("/enhance-prompt").post(enhancePrompt)
export {router as circuitRoutes}