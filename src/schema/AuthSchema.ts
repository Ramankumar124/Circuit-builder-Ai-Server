import * as z from "zod";

export const registerSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Invalid Email" }),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, { message: "Password must be atleast 6 characters long" }),
  fullName: z
    .string({ required_error: "fullname is required" })
    .min(3, { message: "Name must be atleast 3 charactors long" })
    .max(50, { message: "Name is too long" }),
  userName: z
    .string({ required_error: "username  is required" })
    .min(3, { message: "username must be atleast 5 charactors long" })
    .max(50, { message: "UserName is too long" }),
});

export const signinSchema = z.object({
  credential: z.union([
    z.string().email({ message: "Invalid Email" }),
    z
      .string()
      .min(3, { message: "Username must be at least 3 characters long" }),
  ]),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

export const verifyOtp = z.object({
  otp: z.string().min(6, "Otp minimun 6 digit"),
});

export const resendEmailSchema = z.object({
  email: z
    .string({ required_error: "email is required" })
    .email({ message: "Email is invalid" }),
});
export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "email is required" })
    .email({ message: "email is invalid" }),
});

export const verifyForgotPasswordSchema = z.object({
  otp: z.string().min(4, "otp minimum 4 digit"),
});
export const changePasswordSchema = z.object({
  password: z
    .string({ required_error: "Password is required.." })
    .min(6, { message: "Password must be atleast 6 characters long" }),
});
