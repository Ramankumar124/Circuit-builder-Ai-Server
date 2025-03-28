import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/Asynchandler";
import prisma from "../database/prismaClient";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";

export const createProject = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { projectName, prompt, circuit } = req.body;

    if (!circuit) return next(new ApiError(400, "Circuit must be given"));
    const newProject = await prisma.project.create({
      data: {
        projectName,
        prompt,
        circuit,
      },
    });
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
    const userId = req.params?.id;

    const projects = await prisma.project.findMany({
      where: { userId },
      take: limit,
      skip: skip,
      include: {
        circuit: true,
      },
    });
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
    const deletedProject = await prisma.project.delete({
      where: { id: req.params.id },
    });
    if (!deletedProject) {
      return next(new ApiError(404, "Project not found"));
    }
    res.status(200).json(new ApiResponse(200,{},"Project delted successfuly"));
  }
);
