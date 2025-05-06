import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/Asynchandler";
import prisma from "../database/prismaClient";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";

export const createProject = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { projectName, prompt, circuit } = req.body;

//@ts-ignore
    const {id:userId}=req.user;

    if (!circuit) return next(new ApiError(400, "Circuit must be given"));


    const newProject = await prisma.project.create({
      data: {
        projectName,
        prompt,
        userId, 
        circuit:{
          create:{
            circuitName:circuit.circuitName,
            edge:circuit.edge,
            node:circuit.node,
            explaination:circuit.explanation,
          }
        },
      },
    });
    
  if(!newProject)return next(new ApiError(400,"unable to save project"));
    res
      .status(200)
      .json(new ApiResponse(200, newProject, "Project created successfully"));
  }
);


export const getAllProjects = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = Number(req.query?.page) || 1;

    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;
        //@ts-ignore
    const userId = req.user?.id;

    const projects = await prisma.project.findMany({
      where: { userId },
      take: limit,
      skip: skip,
      include: {
        circuit: true,
      },
      
    });

  if(!projects) next(new ApiError(404,"no project avaiable"));
    const totalProjects = await prisma.project.count({
      where: { userId },
    });

    // Pagination meta data
    const totalPages = Math.ceil(totalProjects / limit);
    const previousPage = page - 1 === 0 ? null : page - 1;
    const nextPage = page >= totalPages ? null : page + 1;

    res.status(200).json(
      new ApiResponse(
        200,
        {
          data: projects,
          meta: {
            totalProjects,
            totalPages,
            currentPage: page,
            itemsPerPage: limit,
            previousPage,
            nextPage,
          },
        },
        "All projects sended Succesfully"
      )
    );
  }
);

export const updateProject = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { projectName, prompt, circuit } = req.body;

    if (!circuit) return next(new ApiError(400, "Circuit must be given"));
    const updatedProject = await prisma.project.update({
      where: {
        id: req.params.id,
      },
      data: {
        projectName,
        prompt,
        circuit,
      },
    });
    res
      .status(200)
      .json(
        new ApiResponse(200, updatedProject, "Project updated successfully")
      );
  }
);
export const deleteProject = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Delete in order: Share -> Circuit -> Project
    await prisma.$transaction([
      prisma.share.deleteMany({ where: { projectId: id } }),
      prisma.circuit.deleteMany({ where: { projectId: id } }),
      prisma.project.delete({ where: { id } }),
    ]);

    res.status(200).json(
      new ApiResponse(200, {}, "Project and related data deleted successfully")
    );
  }
);
