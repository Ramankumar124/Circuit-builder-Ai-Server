import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import prisma from "../database/prismaClient"
// import User from "../models/user.model";

export async function jwtVerify(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = await req?.cookies?.accessToken;

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

    const user= await prisma.user.findUnique({
      //@ts-ignore
      where:{id:decodedToken?.id},
      select:{
        id:true,
        email:true,
        fullName:true,
        userName:true
      }
    })
    
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
