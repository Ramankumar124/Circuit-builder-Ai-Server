import { NextFunction, Request, Response } from "express";
import prisma from "../database/prismaClient";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  registerSchema,
  resendEmailSchema,
  signinSchema,
  verifyForgotPasswordSchema,
  verifyOtp,
} from "../schema/AuthSchema";
import { asyncHandler } from "../utils/Asynchandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { generateOtp } from "../utils/genrateOtp";
import { sendEmail, SendEmailVerification } from "../mails/sendMails";
import jwt from "jsonwebtoken";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudnary";
import logger from "../utils/logger";
import {
  comparePassword,
  createAccessToken,
  createRefreshToken,
  generateOtpToken,
} from "../service/user.service";


interface UserDataRequest extends Request {
  user?: { email: string };
}

const genrerateAccessAndRefreshToken = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new ApiError(404, "user not found");

    const accessToken = await createAccessToken(user);
    const refreshToken = await createRefreshToken(user?.id);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: refreshToken },
    });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Something went wrong while gernrating tokens");
  }
};

const registerUser = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { email, password, fullName,userName } = registerSchema.parse(req.body);

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: email },
        { userName: userName },
      ],
    },
  });
  if (existingUser) {
    return next(new ApiError(400, "Email or Username already exists"));
  }

  let uploadAvatar = {
    url: "",
    public_id: "",
  };
  //@ts-ignore
  if (req?.files?.avatar?.length > 0) {
    const files = req.files as {
      [key: string]: Express.Multer.File[];
    };

    const localFilepath = files?.avatar[0].path;
    const data = await uploadToCloudinary(localFilepath);

    uploadAvatar.public_id = data?.public_id!;
    uploadAvatar.url = data?.url!;
    if (!uploadAvatar) {
      return next(new ApiError(400, "avatar upload failed"));
    }
  }
  const user = await prisma.user.create({
    data: {
      fullName: fullName,
      userName:userName,
      email: email,
      password: password,
      otp: generateOtp().toString(),
      avatar: {
        create: {
          url: uploadAvatar.url,
          public_id: uploadAvatar.public_id,
        },
      },
      refreshToken: "",
    },
  });

  const token = await generateOtpToken(user.otp, user.id);

  await sendEmail({
    email: user.email,
    subject: "Email Verifiaction",
    MailgenContent: SendEmailVerification(user.fullName, user.otp),
  });

  const createdUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      fullName: true,
      userName:true,
      email: true,
      isEmailVerified: true,
      createdAt: true,
      updatedAt: true,
      avatar: true,
      Projects:true,
      credits:true,
    },
  });
  if (!createdUser)
    return next(new ApiError(400, "Something went wrong while creating user"));

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none" as const,
    maxAge: 1000 * 60 * 60,
  };

  res
    .status(200)
    .cookie("verifyUser", token, options)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken: any = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    );

    const user = await prisma.user.findUnique({
      where: { id: decodedToken?._id },
    });

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };
    //@ts-ignore
    const { accessToken, newRefreshToken } =
      await genrerateAccessAndRefreshToken(user.id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error: any) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});
const verifyEmail = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { otp } = verifyOtp.parse(req.body);
    const token = req.cookies?.verifyUser;

    if (!token) {
      return next(new ApiError(401, "Invalid Token"));
    }
    const decodedToken: any = await jwt.verify(
      token,
      process.env.OTP_SECRET as string
    );
    if (decodedToken?.otp !== otp) {
      return next(new ApiError(401, "invalid otp"));
    }
    const user = await prisma.user.findUnique(decodedToken.id);
    if (!user) {
      return next(new ApiError(400, "invalid otp"));
    }

    const newUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        otp: undefined,
      },
      select: {
        id: true,
        fullName: true,
        userName:true,
        email: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        avatar: true,
        Projects:true,
        credits:true,
      },
    });

    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(201)
      .clearCookie("verifyUser", options)
      .json(new ApiResponse(201, newUser, "Email verified successfully"));
  }
);

const resendEmail = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = resendEmailSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: email },
    });
    if (!user) {
      return next(new ApiError(400, "User not found"));
    }
    if (user.isEmailVerified) {
      return next(new ApiError(400, "Email already verified"));
    }
    
   const newUser=await prisma.user.update({
    where:{id:user.id},
    data:{
      otp: generateOtp().toString(),
    }
   })
    const token =  generateOtpToken(newUser.otp,newUser.id);
    await sendEmail({
      email: user.email,
      subject: "Email Verification",
      MailgenContent: SendEmailVerification(newUser.fullName, newUser.otp),
    });

    const options = {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 1000 * 60 * 60,
    };

    res
      .status(204)
      //@ts-ignore
      .cookie("verifyUser", token, options)
      .json(new ApiResponse(200, {}, "email resend successfully"));
  }
);
const loginUser = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { credential, password } = signinSchema.parse(req.body);
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: credential }, // If credential is an email, it will match this
        { userName: credential }, // If credential is a username, it will match this
      ],
    },
  });
  
  if (!user) {
    return next(new ApiError(400, "Invalid Crendeitals"));
  }
  const isMatchPassword = await comparePassword(password,user.password);

  if (!isMatchPassword) {
    return next(new ApiError(400, "invalid credentials"));
  }

  const { accessToken, refreshToken } = await genrerateAccessAndRefreshToken(
    user.id
  );


  const logedInUser=await prisma.user.findUnique({
    where:{id:user.id},
    select:{
      id: true,
      fullName: true,
      userName:true,
      email: true,
      isEmailVerified: true,
      createdAt: true,
      updatedAt: true,
      avatar: true,
      Projects:true,
      credits:true,
    }
  })
  if (!logedInUser) {
    return next(new ApiError(400, "Something went wrong while signing user"));
  }

  const options = {
    httpOnly: true, // Prevent JavaScript access
    secure: true,
    sameSite: "none" as const,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, logedInUser, "user signin Successfully"));
});

const logoutUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    await prisma.user.update({
      where:{
        //@ts-ignore
        id:req.user?.id
      },
      data:{
        refreshToken:""
      }
    })
    

    const options = {
      httpOnly: true,
      sameSite: "none" as const,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "signout successfully"));
  }
);

const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = forgotPasswordSchema.parse(req.body);
    const user=await prisma.user.findUnique(({
      where:{email:email}
    }))

    if (!user) {
      return next(new ApiError(400, "check your email"));
    }
 
    const newUser= await prisma.user.update(({
      where:{email:email},
      data:{
        otp:generateOtp().toString()
      }
    }))

    const token = await generateOtpToken(newUser.otp, newUser.id);
   

    sendEmail({
      email: user.email,
      subject: "Email verification",
      MailgenContent: SendEmailVerification(user.fullName, user.otp),
    });

    const option = {
      httpOnly: true,
      secure: true,
      maxAge: 1000 * 60 * 60,
    };

    return res
      .status(200)
      .cookie("verifyUser", token, option)
      .json(new ApiResponse(200, {}, "forgot password successfully"));
  }
);

const verifyForgotPasswordOtp = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { otp } = verifyForgotPasswordSchema.parse(req.body);
    const token = req.cookies?.verifyUser;
    if (!token) {
      return next(new ApiError(401, "invalid token"));
    }
    const decodedToken = await jwt.verify(
      token,
      process.env.OTP_SECRET as string
    );

    //@ts-ignore
    if (decodedToken?.otp !== otp) {
      return next(new ApiError(401, "invalid otp"));
    }
    const user=await prisma.user.findUnique({
          //@ts-ignore
      where:{id:decodedToken.id},

    })
    if (!user) {
      return next(new ApiError(400, "invalid otp"));
    }
   const newUser=await prisma.user.update({
    where:{id:user.id},
    data:{
      otp:undefined
    }
   })

    //@ts-ignore
    const changPasswordToken = await jwt.sign(
      {
        id: user.id,
      },
      process.env.OTP_SECRET as string,
      {
        expiresIn: process.env.OTP_EXPAIRY as string,
      }
    );
    const options = {
      httpOnly: true,
      sameSite: "none" as const,
      secure: true,
      maxAge: 1000 * 60 * 60,
    };
    return res
      .status(201)
      .cookie("changePassword", changPasswordToken, options)
      .clearCookie("verifyUser", options)
      .json(new ApiResponse(201, newUser, "Email verified successfully"));
  }
);

const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { password } = changePasswordSchema.parse(req.body);
    const token = req.cookies?.changePassword;
    if (!token) {
      return next(new ApiError(401, "invalid token"));
    }
    const decodedToken = await jwt.verify(
      token,
      process.env.OTP_SECRET as string
    );
  
    const user=await prisma.user.findUnique({
      //@ts-ignore
      where:{id:decodedToken.id}
    })
    if (!user) {
      return next(new ApiError(400, "Unable to changee password"));
    }
     await prisma.user.update({
         where:{id:user.id},
         data:{
          password:password
         }
     })

    const options = {
      httpOnly: true,
      sameSite: "none" as const,
      secure: true,
      maxAge: 1000 * 60 * 60,
    };
    return res
      .status(201)
      .clearCookie("changePassword", options)
      .json(new ApiResponse(201, {}, "Password changed successfully"));
  }
);
// const updateAvatar = asyncHandler(
//   async (req: Request, res: Response, next: NextFunction) => {
//     //@ts-ignore
//     const user = await User.findById(req.user?._id);

//     if (!user) {
//       return next(new ApiError(404, "user not found"));
//     }

//     //@ts-ignore
//     if (user.avatar.public_id !== "") {
//       // @ts-ignore
//       await deleteFromCloudinary(user?.avatar.public_id);
//     } else {
//       await User.findByIdAndUpdate(
//         //@ts-ignore
//         req.user?._id,
//         {
//           avatar: {
//             url: "",
//             public_id: "",
//           },
//         },
//         {
//           new: true,
//         }
//       );
//     }

//     const files = req.files as {
//       [key: string]: Express.Multer.File[];
//     };

//     const localFilePath = files?.avatar[0].path;

//     const uploadAvatar = await uploadToCloudinary(localFilePath);
//     if (!uploadAvatar) {
//       return next(new ApiError(400, "avatar upload failed"));
//     }

//     const updatedUser = await User.findByIdAndUpdate(
//       //@ts-ignore
//       req.user?._id,
//       {
//         avatar: {
//           url: uploadAvatar?.url,
//           public_id: uploadAvatar?.public_id,
//         },
//       },
//       {
//         new: true,
//       }
//     )
//       .select("-password") // Exclude the password field
//       .populate([
//         {
//           path: "contacts",
//           select: "-password  -contacts",
//         },
//         {
//           path: "friendRequest.sent", // Path to populate friendRequest.sent
//           select: "-password -firebaseToken -contacts -friendRequest", // Fields to exclude or include
//         },
//         {
//           path: "friendRequest.received", // If you want to populate received friend requests as well
//           select: "-password -firebaseToken -contacts -friendRequest",
//         },
//       ]);

//     if (!updatedUser) {
//       return next(new ApiError(400, "avatar Update failed"));
//     }

//     return res
//       .status(200)
//       .json(new ApiResponse(200, updatedUser, "avatar update successfully"));
//   }
// );
const userData = asyncHandler(
  async (req: UserDataRequest, res: Response, next: NextFunction) => {
    const user=await prisma.user.findUnique({
      where:{email: (req.user as { email: string }).email},
      select:{
        id: true,
      fullName: true,
      email: true,
      isEmailVerified: true,
      createdAt: true,
      updatedAt: true,
      avatar: true,
      Projects:true,
      credits:true
      }
    })
 

    if (!user) {
      return next(new ApiError(404, "User Not found"));
    }

    logger.info("populated contacts of user", user);

    res
      .status(200)
      .json(new ApiResponse(200, user, "User Data sended Succesfully"));
  }
);

export {
  registerUser,
  verifyEmail,
  resendEmail,
  logoutUser,
  loginUser,
  forgotPassword,
  verifyForgotPasswordOtp,
  userData,
  refreshAccessToken,
  resetPassword,
};
