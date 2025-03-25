import { createProject,getAllProjects,updateProject } from "../service/project/project.js";
import { Router } from "express";

export const projectRoute = Router();
projectRoute.post("/project", createProject);
projectRoute.get("/projects/:id", getAllProjects);
projectRoute.put("/project/:id", updateProject);