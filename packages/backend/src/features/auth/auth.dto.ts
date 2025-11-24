import * as z from "zod";

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const updateProfileSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .optional(),
    email: z.email("Invalid email address").optional(),
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .optional(),
  })
  .refine(
    (data) => {
      // If newPassword is provided, currentPassword must also be provided
      if (data.newPassword && !data.currentPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Current password is required when updating password",
      path: ["currentPassword"],
    },
  );

// Email verification schemas
export const verifyEmailSchema = z.object({
  email: z.email("Invalid email address"),
  otp: z
    .string()
    .min(6, "OTP must be 6 characters")
    .max(6, "OTP must be 6 characters"),
});

export const resendVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Password reset schemas
export const forgotPasswordSchema = z.object({
  email: z.email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  email: z.email("Invalid email address"),
  otp: z
    .string()
    .min(6, "OTP must be 6 characters")
    .max(6, "OTP must be 6 characters"),
  new_password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginDto = z.infer<typeof loginSchema>;
export type RegisterDto = z.infer<typeof registerSchema>;
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationDto = z.infer<typeof resendVerificationSchema>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
    image?: string;
    emailVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  username: string;
  image?: string;
  emailVerified: boolean;
  createdAt: Date;
}

export interface TokenPayload {
  userId: string;
  email: string;
  username: string;
}
