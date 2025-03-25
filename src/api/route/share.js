import { createShareLink,getLink } from "../service/share/share.js";
import { Router } from "express";
import {protectRoute} from "../middleware/protectRoute.js"

export const shareRouter = Router();

shareRouter.post("/share",protectRoute, createShareLink)
shareRouter.get("/share/:shareId", getLink)