import { upload } from "../middleware/multer.middleware";
import {
  forgotPassword,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmail,
  resetPassword,
  userData,
  verifyEmail,
  verifyForgotPasswordOtp,
} from "../controller/auth.Controller.js";
import { jwtVerify } from "../middleware/verify.middleware.js";
import { Router } from "express";

const router = Router();

router
  .route("/register")
  .post(upload.fields([{ name: "avatar", maxCount: 1 }]), registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/verifyEmail").post(verifyEmail);
router.route("/resendEmail").post(resendEmail);
router.route("/forgotPassword").post(forgotPassword);
router.route("/resetPassword").post(resetPassword);
router.route("/verifyForgotPasswordOtp").post(verifyForgotPasswordOtp);
router.route("/logout").post(jwtVerify, logoutUser);
router.route("/getUserData").get(jwtVerify, userData);

export { router as authRoutes };
