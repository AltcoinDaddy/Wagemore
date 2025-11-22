import * as z from "zod";
import dotenv from "dotenv";

dotenv.config();

const EnvSchema = z.object({
  PORT: z.coerce.number().default(3001),
  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  NODE_ENV: z.string().default("development"),

  // Gmail SMTP Configuration
  SMTP_HOST: z
    .string()
    .refine(
      (host) => host === "smtp.gmail.com",
      "SMTP host must be smtp.gmail.com for Gmail",
    ),
  SMTP_PORT: z.coerce
    .number()
    .refine(
      (port) => port === 587 || port === 465,
      "Gmail SMTP port must be 587 or 465",
    ),
  SMTP_USER: z
    .string()
    .email("Invalid Gmail address")
    .refine((email) => email.endsWith("@gmail.com"), "Must be a Gmail address"),
  SMTP_PASSWORD: z.string().min(16, "Gmail app password must be 16 characters"),
  SMTP_FROM: z.string().email("Invalid from email address"),
});

export const processEnv = EnvSchema.parse(process.env);

// Export individual env values for easier access
export const env = {
  PORT: processEnv.PORT,
  JWT_SECRET: processEnv.JWT_SECRET,
  JWT_REFRESH_SECRET: processEnv.JWT_REFRESH_SECRET,
  NODE_ENV: processEnv.NODE_ENV,
  SMTP_HOST: processEnv.SMTP_HOST,
  SMTP_PORT: processEnv.SMTP_PORT,
  SMTP_USER: processEnv.SMTP_USER,
  SMTP_PASSWORD: processEnv.SMTP_PASSWORD,
  SMTP_FROM: processEnv.SMTP_FROM,
} as const;
