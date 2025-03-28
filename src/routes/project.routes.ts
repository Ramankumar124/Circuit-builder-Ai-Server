import { createProject, deleteProject, getAllProjects, updateProject } from "../controller/project.controller";
import { Router } from "express";

 const router = Router();
router.route("/create-project").post(createProject);
router.route("/get-All-project").get(getAllProjects);
router.route("/update-project").patch(updateProject);
router.route("/delete-project/:id").delete(deleteProject);

export {router as projectRoutes}