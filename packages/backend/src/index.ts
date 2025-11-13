import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { ErrorResponse } from "./types";

const app = new Hono();

// Enable CORS for frontend
app.use(
  "*",
  cors({
    origin: (origin) => origin || "*", // Allow all origins in development
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "Cookie"],
  }),
);

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
