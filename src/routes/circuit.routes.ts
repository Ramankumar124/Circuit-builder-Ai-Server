import { createCircuit, enhancePrompt, getComponentDetails } from "../controller/circuit.controller";
import { Router } from "express";

const router = Router();

router.route("/create-circuit").post(createCircuit);
router.route("/enhance-prompt").post(enhancePrompt);
router.route("/componentDetail").post(getComponentDetails);
export {router as circuitRoutes}