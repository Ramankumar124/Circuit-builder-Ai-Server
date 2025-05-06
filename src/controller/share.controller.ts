import { asyncHandler } from "../utils/Asynchandler";
import { NextFunction, Request, Response } from "express";
import prisma from "../database/prismaClient";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

export const createShareLink = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("kuch to aya");
    console.log("params", req.params);

    const projectId = req.query?.projectId as string;
    console.log(req.body);
    console.log(projectId);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return next(new ApiError(404, "Project not found"));
    }

    const existingShare = await prisma.share.findFirst({
      where: {
        projectId: projectId,
        isShared: true,
      },
    });
    if (existingShare) {
      return res
        .status(201)
        .json(
          new ApiResponse(
            201,
            `${process.env.FRONTEND_URL}/shared/${existingShare.id}`,
            "shareeable link sended"
          )
        );
    }

    const newShare = await prisma.share.create({
      data: {
        isShared: true,
        projectId,
      },
    });

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          `${process.env.FRONTEND_URL}/shared/${newShare.id}`,
          "share link created"
        )
      );
  }
);

export const getSharedProjectData = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { shareId } = req.params;

    const share = await prisma.share.findUnique({
      where: { id: shareId },
      include: {
        project: {
          include: {
            circuit: true,
          },
        },
      },
    });

    if (!share) {
      return next(new ApiError(400, "Invalid Link"));
    }

    if (!share.projectId) {
      return next(new ApiError(404, "project not found"));
    }

    res.status(200).json(new ApiResponse(200, share, "shared project data"));
  }
);
