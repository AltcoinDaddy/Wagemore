import type { Context } from "hono";
import { ZodError } from "zod";
import { authService } from "./auth.service";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.dto";
import { createZodErrorResponse } from "../../utils/zod-error-formatter";
import type { SuccessResponse, ErrorResponse } from "../../types";
import type { AuthResponse, UserProfile } from "./auth.dto";

class AuthController {
  async register(c: Context): Promise<Response> {
    try {
      const body = await c.req.json();

      // Validate input
      const validatedData = registerSchema.parse(body);

      // Register user
      const result = await authService.register(validatedData);

      const response: SuccessResponse<AuthResponse> = {
        success: true,
        message: "Account created successfully! Welcome aboard.",
        data: result,
      };

      return c.json(response, 201);
    } catch (error) {
      console.error("Registration error:", error);

      // Handle Zod validation errors
      if (error instanceof ZodError) {
        const zodErrorResponse = createZodErrorResponse(error);
        return c.json(zodErrorResponse, 422); // 422 Unprocessable Entity for validation errors
      }

      // Handle other errors
      const errorResponse: ErrorResponse = {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Registration failed. Please try again.",
        isFormError: false,
      };

      return c.json(errorResponse, 400);
    }
  }

  async login(c: Context): Promise<Response> {
    try {
      const body = await c.req.json();

      // Validate input
      const validatedData = loginSchema.parse(body);

      // Login user
      const result = await authService.login(validatedData);

      const response: SuccessResponse<AuthResponse> = {
        success: true,
        message: "Welcome back! Login successful.",
        data: result,
      };

      return c.json(response, 200);
    } catch (error) {
      console.error("Login error:", error);

      // Handle Zod validation errors
      if (error instanceof ZodError) {
        const zodErrorResponse = createZodErrorResponse(error);
        return c.json(zodErrorResponse, 422);
      }

      // Handle other errors
      const errorResponse: ErrorResponse = {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Login failed. Please check your credentials.",
        isFormError: false,
      };

      return c.json(errorResponse, 401);
    }
  }

  async logout(c: Context): Promise<Response> {
    try {
      const body = await c.req.json();
      const { refreshToken } = body;

      await authService.logout(refreshToken);

      const response: SuccessResponse = {
        success: true,
        message: "Successfully logged out. See you next time!",
      };

      return c.json(response, 200);
    } catch (error) {
      console.error("Logout error:", error);

      const errorResponse: ErrorResponse = {
        success: false,
        message: "Logout failed. Please try again.",
      };

      return c.json(errorResponse, 500);
    }
  }

  async updateProfile(c: Context): Promise<Response> {
    try {
      // Get user from context (set by auth middleware)
      const currentUser = c.get("user");

      if (!currentUser) {
        const errorResponse: ErrorResponse = {
          success: false,
          message: "Authentication required. Please log in.",
        };
        return c.json(errorResponse, 401);
      }

      const body = await c.req.json();

      // Validate input
      const validatedData = updateProfileSchema.parse(body);

      // Update user profile
      const updatedUser = await authService.updateProfile(
        currentUser.id,
        validatedData,
      );

      const response: SuccessResponse<{ user: UserProfile }> = {
        success: true,
        message: "Profile updated successfully!",
        data: { user: updatedUser },
      };

      return c.json(response, 200);
    } catch (error) {
      console.error("Update profile error:", error);

      // Handle Zod validation errors
      if (error instanceof ZodError) {
        const zodErrorResponse = createZodErrorResponse(error);
        return c.json(zodErrorResponse, 422);
      }

      // Handle other errors
      const errorResponse: ErrorResponse = {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update profile. Please try again.",
        isFormError: false,
      };

      return c.json(errorResponse, 400);
    }
  }

  async sendEmailVerification(c: Context): Promise<Response> {
    try {
      const body = await c.req.json();
      const validatedData = resendVerificationSchema.parse(body);

      await authService.sendEmailVerification(validatedData.email);

      const response: SuccessResponse = {
        success: true,
        message:
          "Verification email sent successfully. Please check your inbox.",
      };

      return c.json(response, 200);
    } catch (error) {
      console.error("Send verification error:", error);

      // Handle Zod validation errors
      if (error instanceof ZodError) {
        const zodErrorResponse = createZodErrorResponse(error);
        return c.json(zodErrorResponse, 422);
      }

      const errorResponse: ErrorResponse = {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to send verification email",
      };

      return c.json(errorResponse, 400);
    }
  }

  async verifyEmail(c: Context): Promise<Response> {
    try {
      const body = await c.req.json();
      const validatedData = verifyEmailSchema.parse(body);

      const verifiedUser = await authService.verifyEmail(validatedData);

      const response: SuccessResponse<{ user: UserProfile }> = {
        success: true,
        message:
          "Email verified successfully! You can now access all features.",
        data: { user: verifiedUser },
      };

      return c.json(response, 200);
    } catch (error) {
      console.error("Email verification error:", error);

      // Handle Zod validation errors
      if (error instanceof ZodError) {
        const zodErrorResponse = createZodErrorResponse(error);
        return c.json(zodErrorResponse, 422);
      }

      const errorResponse: ErrorResponse = {
        success: false,
        message:
          error instanceof Error ? error.message : "Email verification failed",
        isFormError: true,
      };

      return c.json(errorResponse, 400);
    }
  }

  async forgotPassword(c: Context): Promise<Response> {
    try {
      const body = await c.req.json();
      const validatedData = forgotPasswordSchema.parse(body);

      await authService.forgotPassword(validatedData);

      const response: SuccessResponse = {
        success: true,
        message:
          "If an account with that email exists, we've sent a password reset code.",
      };

      return c.json(response, 200);
    } catch (error) {
      console.error("Forgot password error:", error);

      // Always return success for security (don't reveal if email exists)
      const response: SuccessResponse = {
        success: true,
        message:
          "If an account with that email exists, we've sent a password reset code.",
      };

      return c.json(response, 200);
    }
  }

  async resetPassword(c: Context): Promise<Response> {
    try {
      const body = await c.req.json();
      const validatedData = resetPasswordSchema.parse(body);

      await authService.resetPassword(validatedData);

      const response: SuccessResponse = {
        success: true,
        message:
          "Password reset successfully! Please login with your new password.",
      };

      return c.json(response, 200);
    } catch (error) {
      console.error("Reset password error:", error);

      // Handle Zod validation errors
      if (error instanceof ZodError) {
        const zodErrorResponse = createZodErrorResponse(error);
        return c.json(zodErrorResponse, 422);
      }

      const errorResponse: ErrorResponse = {
        success: false,
        message:
          error instanceof Error ? error.message : "Password reset failed",
        isFormError: true,
      };

      return c.json(errorResponse, 400);
    }
  }
}

export const authController = new AuthController();
