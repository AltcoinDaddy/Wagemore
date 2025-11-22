import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.dto";
import { authController } from "./auth.controller";
import { authMiddleware } from "./auth.middleware";
import type { SuccessResponse } from "../../types";

const authRouter = new Hono()
  // Public routes with validation
  .post(
    "/register",
    zValidator("json", registerSchema),
    authController.register.bind(authController),
  )
  .post(
    "/login",
    zValidator("json", loginSchema),
    authController.login.bind(authController),
  )
  .post("/logout", authController.logout.bind(authController))

  // Email verification routes
  .post(
    "/verify-email",
    zValidator("json", verifyEmailSchema),
    authController.verifyEmail.bind(authController),
  )
  .post(
    "/resend-verification",
    zValidator("json", resendVerificationSchema),
    authController.sendEmailVerification.bind(authController),
  )

  // Password reset routes
  .post(
    "/forgot-password",
    zValidator("json", forgotPasswordSchema),
    authController.forgotPassword.bind(authController),
  )
  .post(
    "/reset-password",
    zValidator("json", resetPasswordSchema),
    authController.resetPassword.bind(authController),
  )

  // Protected routes (require authentication)
  .put(
    "/update-profile",
    authMiddleware,
    zValidator("json", updateProfileSchema),
    authController.updateProfile.bind(authController),
  )

  // Health check
  .get("/health", (c) => {
    const response: SuccessResponse = {
      success: true,
      message: "Auth service is healthy and running",
    };
    return c.json(response);
  });

export default authRouter;
