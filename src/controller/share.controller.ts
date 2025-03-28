import { asyncHandler } from "../utils/Asynchandler";
import { NextFunction, Request, Response } from "express";
import prisma from "../database/prismaClient";
import { ApiError } from "../utils/ApiError";
import { projectShareSchema } from "../schema/projectSchema";
import { ApiResponse } from "../utils/ApiResponse";

export const createShareLink = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const projectId = projectShareSchema.parse(req.body);
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
      return res.send({
        shareableLink: `http://${process.env?.FRONTEND_URL}/shared/${existingShare.id}`,
      });
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
          `https://${process.env?.FRONTEND_URL}/shared/${newShare.id}`,
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
            User: true,
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
