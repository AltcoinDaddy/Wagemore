import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { user, session } from "../../db/schema";
import { emailService } from "../../services/email.service";
import { otpService } from "../../services/otp.service";
import type {
  RegisterDto,
  LoginDto,
  UpdateProfileDto,
  VerifyEmailDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  AuthResponse,
  UserProfile,
  TokenPayload,
} from "./auth.dto";
import { processEnv } from "@/config";

class AuthService {
  private readonly JWT_SECRET = processEnv.JWT_SECRET;
  private readonly JWT_REFRESH_SECRET = processEnv.JWT_REFRESH_SECRET;
  private readonly ACCESS_TOKEN_EXPIRES = "15m";
  private readonly REFRESH_TOKEN_EXPIRES = "7d";

  async register(data: RegisterDto): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(user)
        .where(eq(user.email, data.email))
        .limit(1);

      if (existingUser.length > 0) {
        throw new Error("User with this email already exists");
      }

      // Check if username is taken
      const existingUsername = await db
        .select()
        .from(user)
        .where(eq(user.username, data.username))
        .limit(1);

      if (existingUsername.length > 0) {
        throw new Error("Username is already taken");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // Generate multi-avatar URL based on username
      const avatarUrl = `https://api.multiavatar.com/${encodeURIComponent(
        data.username,
      )}.svg`;

      // Create user
      const [newUser] = await db
        .insert(user)
        .values({
          id: crypto.randomUUID(),
          name: data.name,
          email: data.email,
          username: data.username,
          password: hashedPassword,
          image: avatarUrl,
          emailVerified: false,
        })
        .returning({
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          image: user.image,
          emailVerified: user.emailVerified,
        });

      // Generate tokens
      const { accessToken, refreshToken } = await this.generateTokens(newUser);

      // Send verification email automatically
      try {
        await this.sendEmailVerification(data.email);
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        // Don't fail registration if email sending fails
      }

      return {
        user: {
          ...newUser,
          image: newUser.image || undefined,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Registration failed");
    }
  }

  async login(data: LoginDto): Promise<AuthResponse> {
    try {
      // Find user by email
      const [foundUser] = await db
        .select()
        .from(user)
        .where(eq(user.email, data.email))
        .limit(1);

      if (!foundUser) {
        throw new Error("Invalid email or password");
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(
        data.password,
        foundUser.password,
      );

      if (!isValidPassword) {
        throw new Error("Invalid email or password");
      }

      // Generate tokens
      const { accessToken, refreshToken } = await this.generateTokens({
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        username: foundUser.username,
        image: foundUser.image,
        emailVerified: foundUser.emailVerified,
      });

      return {
        user: {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          username: foundUser.username,
          image: foundUser.image || undefined,
          emailVerified: foundUser.emailVerified,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Login failed");
    }
  }

  async updateProfile(
    userId: string,
    data: UpdateProfileDto,
  ): Promise<UserProfile> {
    try {
      // Get current user
      const [currentUser] = await db
        .select()
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

      if (!currentUser) {
        throw new Error("User not found");
      }

      // If updating email, check if it's already taken
      if (data.email && data.email !== currentUser.email) {
        const existingUser = await db
          .select()
          .from(user)
          .where(eq(user.email, data.email))
          .limit(1);

        if (existingUser.length > 0) {
          throw new Error("Email is already taken");
        }
      }

      // If updating username, check if it's already taken
      if (data.username && data.username !== currentUser.username) {
        const existingUsername = await db
          .select()
          .from(user)
          .where(eq(user.username, data.username))
          .limit(1);

        if (existingUsername.length > 0) {
          throw new Error("Username is already taken");
        }
      }

      // If updating password, verify current password
      let hashedPassword = currentUser.password;
      if (data.newPassword && data.currentPassword) {
        const isValidCurrentPassword = await bcrypt.compare(
          data.currentPassword,
          currentUser.password,
        );

        if (!isValidCurrentPassword) {
          throw new Error("Current password is incorrect");
        }

        hashedPassword = await bcrypt.hash(data.newPassword, 12);
      }

      // Generate new avatar if username is updated
      let imageUrl = currentUser.image;
      if (data.username && data.username !== currentUser.username) {
        imageUrl = `https://api.multiavatar.com/${encodeURIComponent(
          data.username,
        )}.svg`;
      }

      // Update user
      const [updatedUser] = await db
        .update(user)
        .set({
          name: data.name ?? currentUser.name,
          email: data.email ?? currentUser.email,
          username: data.username ?? currentUser.username,
          password: hashedPassword,
          image: imageUrl,
          updatedAt: new Date(),
        })
        .where(eq(user.id, userId))
        .returning({
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          image: user.image,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        });

      return {
        ...updatedUser,
        image: updatedUser.image || undefined,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to update profile");
    }
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      if (refreshToken) {
        await db.delete(session).where(eq(session.token, refreshToken));
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Don't throw error for logout - it should always succeed
    }
  }

  async getUserById(userId: string): Promise<UserProfile | null> {
    try {
      const [foundUser] = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          image: user.image,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

      return foundUser
        ? {
            ...foundUser,
            image: foundUser.image || undefined,
          }
        : null;
    } catch (error) {
      console.error("Get user by ID error:", error);
      return null;
    }
  }

  verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.JWT_SECRET) as TokenPayload;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  private async generateTokens(userData: {
    id: string;
    name: string;
    email: string;
    username: string;
    image?: string | null;
    emailVerified: boolean;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload: TokenPayload = {
        userId: userData.id,
        email: userData.email,
        username: userData.username,
      };

      const accessToken = jwt.sign(payload, this.JWT_SECRET, {
        expiresIn: this.ACCESS_TOKEN_EXPIRES,
      });

      const refreshToken = jwt.sign(payload, this.JWT_REFRESH_SECRET, {
        expiresIn: this.REFRESH_TOKEN_EXPIRES,
      });

      // Store refresh token in database
      await db.insert(session).values({
        id: crypto.randomUUID(),
        userId: userData.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      return { accessToken, refreshToken };
    } catch (error) {
      console.error("Token generation error:", error);
      throw new Error("Failed to generate authentication tokens");
    }
  }

  async sendEmailVerification(email: string): Promise<void> {
    try {
      // Check if user exists
      const [foundUser] = await db
        .select()
        .from(user)
        .where(eq(user.email, email))
        .limit(1);

      if (!foundUser) {
        throw new Error("User not found");
      }

      if (foundUser.emailVerified) {
        throw new Error("Email is already verified");
      }

      // Generate OTP
      const otpCode = await otpService.generateOTP(email, "email_verification");

      // Send verification email
      await emailService.sendEmailVerification(email, foundUser.name, otpCode);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to send verification email");
    }
  }

  async verifyEmail(data: VerifyEmailDto): Promise<UserProfile> {
    try {
      // Verify OTP
      const isValidOTP = await otpService.verifyOTP(
        data.email,
        data.otp,
        "email_verification",
      );

      if (!isValidOTP) {
        throw new Error("Invalid or expired verification code");
      }

      // Update user email verification status
      const [updatedUser] = await db
        .update(user)
        .set({
          emailVerified: true,
          updatedAt: new Date(),
        })
        .where(eq(user.email, data.email))
        .returning({
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          image: user.image,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        });

      if (!updatedUser) {
        throw new Error("User not found");
      }

      return {
        ...updatedUser,
        image: updatedUser.image || undefined,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Email verification failed");
    }
  }

  async forgotPassword(data: ForgotPasswordDto): Promise<void> {
    try {
      // Check if user exists
      const [foundUser] = await db
        .select()
        .from(user)
        .where(eq(user.email, data.email))
        .limit(1);

      if (!foundUser) {
        // Don't reveal if email exists or not for security
        return;
      }

      // Generate OTP
      const otpCode = await otpService.generateOTP(
        data.email,
        "password_reset",
      );

      // Send password reset email
      await emailService.sendPasswordResetEmail(
        data.email,
        foundUser.name,
        otpCode,
      );
    } catch (error) {
      console.error("Forgot password error:", error);
      // Don't throw error to avoid revealing if email exists
    }
  }

  async resetPassword(data: ResetPasswordDto): Promise<void> {
    try {
      // Verify OTP
      const isValidOTP = await otpService.verifyOTP(
        data.email,
        data.otp,
        "password_reset",
      );

      if (!isValidOTP) {
        throw new Error("Invalid or expired reset code");
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(data.new_password, 12);

      // Update user password
      await db
        .update(user)
        .set({
          password: hashedPassword,
          updatedAt: new Date(),
        })
        .where(eq(user.email, data.email));

      // Invalidate all user sessions
      const [foundUser] = await db
        .select()
        .from(user)
        .where(eq(user.email, data.email))
        .limit(1);

      if (foundUser) {
        await db.delete(session).where(eq(session.userId, foundUser.id));
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Password reset failed");
    }
  }
}

export const authService = new AuthService();
