import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { HTTPException } from "hono/http-exception";
import { ErrorResponse } from "./types";
import authRouter from "./features/auth/auth.routes";
import { contextMiddleware } from "@/middleware";

const app = new Hono();

// Apply CORS middleware globally
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"], // Add your frontend URL
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// Apply context middleware globally
app.use("*", contextMiddleware);

app.basePath("/api").route("/auth", authRouter);

// Health check
app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    const errResponse =
      error.res ??
      c.json<ErrorResponse>({
        success: false,
        message: error.message,
        isFormError:
          error.cause &&
          typeof error.cause === "object" &&
          "form" in error.cause
            ? error.cause.form === true
            : false,
      });

    return errResponse;
  }

  return c.json<ErrorResponse>(
    {
      success: false,
      message:
        process.env.NODE_ENV === "production"
          ? "Internal Server Error"
          : (error.stack ?? error?.message),
    },
    500,
  );
});

const port = 3001;

serve({
  fetch: app.fetch,
  port,
});

console.log(`✅ Backend listening on http://localhost:${port}`);

export default app;
