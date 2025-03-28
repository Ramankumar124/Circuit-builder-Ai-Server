
import { Router } from "express";
import { createShareLink, getSharedProjectData } from "../controller/share.controller";


 const router  = Router();

router.route("/create-share").get(createShareLink)
router.route("/:shareId").get(getSharedProjectData)

export {router as ShareRoutes}