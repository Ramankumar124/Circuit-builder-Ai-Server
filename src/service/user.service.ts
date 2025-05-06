import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// 🔹 Compare Password
export const comparePassword = async (inputPassword: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(inputPassword, hashedPassword);
};

// 🔹 Create Access Token
export const createAccessToken = (user: { id: string; fullName: string; email: string }): string => {
    //@ts-ignore
  return jwt.sign(
    { id: user.id, fullName: user.fullName, email: user.email },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY as string }
  );
};

//  Create Refresh Token
export const createRefreshToken = (userId: string): string => {
    //@ts-ignore

  return jwt.sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY as string || "10d" }
  );
};

//  Generate OTP Token
export const generateOtpToken = (otp: string, userId:string): string => {
    //@ts-ignore
  return jwt.sign(
    { otp, id: userId },
    process.env.OTP_SECRET as string,
    { expiresIn: process.env.OTP_EXPAIRY as string }
  );
};

