import type { Context, Next } from "hono";
import { authService } from "./auth.service";
import type { ErrorResponse } from "@/types";

export async function authMiddleware(c: Context, next: Next) {
  try {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const errorResponse: ErrorResponse = {
        success: false,
        message: "Authorization token required",
      };
      return c.json(errorResponse, 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = authService.verifyToken(token);

    // Get user from database
    const userData = await authService.getUserById(payload.userId);

    if (!userData) {
      const errorResponse: ErrorResponse = {
        success: false,
        message: "User not found",
      };
      return c.json(errorResponse, 401);
    }

    // Set user in context for use in controllers
    c.set("user", userData);

    await next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    const errorResponse: ErrorResponse = {
      success: false,
      message: "Invalid or expired token",
    };
    return c.json(errorResponse, 401);
  }
}

// Optional middleware - doesn't fail if no token provided
export async function optionalAuthMiddleware(c: Context, next: Next) {
  try {
    const authHeader = c.req.header("Authorization");

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const payload = authService.verifyToken(token);
      const userData = await authService.getUserById(payload.userId);

      if (userData) {
        c.set("user", userData);
      }
    }

    await next();
  } catch (error) {
    await next();
  }
}
