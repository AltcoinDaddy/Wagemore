import type { Context, Next } from "hono";
import { db } from "../db";
import { authService } from "../features/auth/auth.service";

// Define the context interface that will be available throughout the app
export interface AppContext {
  db: typeof db;
  services: {
    auth: typeof authService;
  };
  utils: {
    getCurrentTimestamp: () => Date;
    generateRequestId: () => string;
  };
  request: {
    id: string;
    startTime: Date;
    ip?: string;
    userAgent?: string;
  };
}

// Extend Hono's context with our custom context
declare module "hono" {
  interface ContextVariableMap {
    appContext: AppContext;
  }
}

/**
 * Context middleware that provides shared services, utilities, and request metadata
 * to all route handlers throughout the application.
 */
export async function contextMiddleware(c: Context, next: Next) {
  const requestId = generateRequestId();
  const startTime = new Date();

  // Extract request metadata
  const ip =
    c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
  const userAgent = c.req.header("user-agent") || "unknown";

  // Create the application context
  const appContext: AppContext = {
    // Database connection
    db,

    // Services
    services: {
      auth: authService,
    },

    // Utility functions
    utils: {
      getCurrentTimestamp: () => new Date(),
      generateRequestId,
    },

    // Request metadata
    request: {
      id: requestId,
      startTime,
      ip,
      userAgent,
    },
  };

  // Set the context in Hono's context
  c.set("appContext", appContext);

  // Log request start (optional, can be removed if not needed)
  console.log(
    `[${requestId}] ${c.req.method} ${c.req.path} - Started at ${startTime.toISOString()}`,
  );

  await next();

  // Log request completion (optional, can be removed if not needed)
  const endTime = new Date();
  const duration = endTime.getTime() - startTime.getTime();
  console.log(
    `[${requestId}] ${c.req.method} ${c.req.path} - Completed in ${duration}ms`,
  );
}

/**
 * Helper function to get the app context from Hono context
 */
export function getAppContext(c: Context): AppContext {
  const appContext = c.get("appContext");
  if (!appContext) {
    throw new Error(
      "App context not found. Make sure contextMiddleware is applied.",
    );
  }
  return appContext;
}

/**
 * Utility function to generate a unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Context factory for creating custom context instances (useful for testing)
 */
export function createAppContext(overrides?: Partial<AppContext>): AppContext {
  const defaultContext: AppContext = {
    db,
    services: {
      auth: authService,
    },
    utils: {
      getCurrentTimestamp: () => new Date(),
      generateRequestId,
    },
    request: {
      id: generateRequestId(),
      startTime: new Date(),
      ip: "test",
      userAgent: "test",
    },
  };

  return { ...defaultContext, ...overrides };
}

/**
 * Type guard to check if context has been properly initialized
 */
export function hasAppContext(
  c: Context,
): c is Context & { get(key: "appContext"): AppContext } {
  return c.get("appContext") !== undefined;
}
