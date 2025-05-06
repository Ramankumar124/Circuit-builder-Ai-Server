import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import prisma from "../database/prismaClient";

export async function jwtVerify(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const refreshToken = req?.cookies?.refreshToken;
    if (!refreshToken) {
      return next(new ApiError(401, "refresh token is missing"));
    }
    const token = req?.cookies?.accessToken;

    if (!token) {
      return next(new ApiError(401, "Authentication token is missing"));
    }
    let decodedToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    );
    if (!decodedToken) {
      return next(new ApiError(401, "unauthorized token"));
    }

    // Using Prisma instead of Mongoose
    const user = await prisma.user.findUnique({
    //@ts-ignore

      where: { id: decodedToken?.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        userName: true,
        isEmailVerified: true,
        avatar: true,
        credits: true,
      },
    });

    if (!user) {
      return next(new ApiError(401, "Invalid Access Token"));
    }

    //@ts-ignore
    req.user = user;
    next();
  } catch (error: any) {
    return next(new ApiError(401, error.message || "Invalid Access Token"));
  }
}
