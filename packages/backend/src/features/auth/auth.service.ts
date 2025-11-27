import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq, or, and } from "drizzle-orm";
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

  // OPTIMIZATION: Reduced rounds from 12 to 10 (approx 4x faster, still secure)
  private readonly SALT_ROUNDS = 10;

  async register(data: RegisterDto): Promise<AuthResponse> {
    try {
      // OPTIMIZATION: Run Hashing and DB Checks in PARALLEL
      // We don't wait for one to finish before starting the other.
      const [hashedPassword, existingUsers] = await Promise.all([
        bcrypt.hash(data.password, this.SALT_ROUNDS),
        db
          .select({ email: user.email, username: user.username })
          .from(user)
          .where(
            or(eq(user.email, data.email), eq(user.username, data.username)),
          )
          .limit(1),
      ]);

      // Check results from the parallel DB query
      if (existingUsers.length > 0) {
        const found = existingUsers[0];
        if (found.email === data.email)
          throw new Error("User with this email already exists");
        if (found.username === data.username)
          throw new Error("Username is already taken");
      }

      const avatarUrl = `https://api.multiavatar.com/${encodeURIComponent(data.username)}.svg`;
      const userId = crypto.randomUUID();

      // OPTIMIZATION: Use a Transaction.
      // This ensures User + Session are created in one network round-trip context
      // and guarantees data integrity.
      const { newUser, tokens } = await db.transaction(async (tx) => {
        // 1. Create User
        const [insertedUser] = await tx
          .insert(user)
          .values({
            id: userId,
            name: data.name,
            email: data.email,
            username: data.username,
            password: hashedPassword,
            image: avatarUrl,
            emailVerified: false,
          })
          .returning(); // Drizzle usually returns all fields by default on returning()

        // 2. Generate Tokens (CPU bound, fast)
        const tokens = this.generateTokensSync({
          id: insertedUser.id,
          email: insertedUser.email,
          username: insertedUser.username,
        });

        // 3. Store Refresh Token
        await tx.insert(session).values({
          id: crypto.randomUUID(),
          userId: insertedUser.id,
          token: tokens.refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        return { newUser: insertedUser, tokens };
      });

      // OPTIMIZATION: Fire and Forget.
      // Do NOT await this. Let it run in the background.
      this.sendEmailVerification(data.email).catch((err) =>
        console.error("Background Email Error:", err),
      );

      return {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          username: newUser.username,
          image: newUser.image || undefined,
          emailVerified: newUser.emailVerified,
        },
        ...tokens,
      };
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error("Registration failed");
    }
  }

  async login(data: LoginDto): Promise<AuthResponse> {
    try {
      // 1. Fetch User
      const [foundUser] = await db
        .select()
        .from(user)
        .where(eq(user.email, data.email))
        .limit(1);

      if (!foundUser) throw new Error("Invalid email or password");

      // 2. Verify Password
      const isValidPassword = await bcrypt.compare(
        data.password,
        foundUser.password,
      );
      if (!isValidPassword) throw new Error("Invalid email or password");

      // 3. Generate Tokens & Save Session in Parallel
      // We calculate tokens first (sync), then save to DB
      const tokens = this.generateTokensSync({
        id: foundUser.id,
        email: foundUser.email,
        username: foundUser.username,
      });

      await db.insert(session).values({
        id: crypto.randomUUID(),
        userId: foundUser.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
        ...tokens,
      };
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error("Login failed");
    }
  }

  async updateProfile(
    userId: string,
    data: UpdateProfileDto,
  ): Promise<UserProfile> {
    try {
      const [currentUser] = await db
        .select()
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);
      if (!currentUser) throw new Error("User not found");

      // OPTIMIZATION: Check Email/Username Uniqueness in Parallel
      const checks: Promise<any>[] = [];
      if (data.email && data.email !== currentUser.email) {
        checks.push(
          db
            .select({ id: user.id })
            .from(user)
            .where(eq(user.email, data.email))
            .limit(1)
            .then((res) => {
              if (res.length) throw new Error("Email is already taken");
            }),
        );
      }
      if (data.username && data.username !== currentUser.username) {
        checks.push(
          db
            .select({ id: user.id })
            .from(user)
            .where(eq(user.username, data.username))
            .limit(1)
            .then((res) => {
              if (res.length) throw new Error("Username is already taken");
            }),
        );
      }

      // OPTIMIZATION: If password update, hash in parallel with DB checks
      let passwordPromise = Promise.resolve(currentUser.password);
      if (data.newPassword && data.currentPassword) {
        checks.push(
          bcrypt
            .compare(data.currentPassword, currentUser.password)
            .then((valid) => {
              if (!valid) throw new Error("Current password is incorrect");
            }),
        );
        passwordPromise = bcrypt.hash(data.newPassword, this.SALT_ROUNDS);
      }

      // Wait for all validation checks and hashing to finish
      await Promise.all(checks);
      const newPassword = await passwordPromise;

      // Update Logic
      let imageUrl = currentUser.image;
      if (data.username && data.username !== currentUser.username) {
        imageUrl = `https://api.multiavatar.com/${encodeURIComponent(data.username)}.svg`;
      }

      const [updatedUser] = await db
        .update(user)
        .set({
          name: data.name ?? currentUser.name,
          email: data.email ?? currentUser.email,
          username: data.username ?? currentUser.username,
          password: newPassword,
          image: imageUrl,
          updatedAt: new Date(),
        })
        .where(eq(user.id, userId))
        .returning();

      return {
        ...updatedUser,
        image: updatedUser.image || undefined,
      };
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error("Failed to update profile");
    }
  }

  async logout(refreshToken: string): Promise<void> {
    if (!refreshToken) return;
    try {
      await db.delete(session).where(eq(session.token, refreshToken));
    } catch (e) {
      console.error("Logout cleanup failed", e);
    }
  }

  async getUserById(userId: string): Promise<UserProfile | null> {
    const [foundUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);
    if (!foundUser) return null;
    return { ...foundUser, image: foundUser.image || undefined };
  }

  verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.JWT_SECRET) as TokenPayload;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  // OPTIMIZATION: Synchronous Token Generation
  // Removed async/await because jwt.sign is synchronous in this usage.
  // Also removed the DB call from here to allow Transaction batching in register/login methods.
  private generateTokensSync(userData: {
    id: string;
    email: string;
    username: string;
  }) {
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

    return { accessToken, refreshToken };
  }

  async sendEmailVerification(email: string): Promise<void> {
    // Note: The controller calling this should NOT await it if they want speed.
    // Logic inside remains the same, but we optimize the lookup.
    const [foundUser] = await db
      .select({
        name: user.name,
        emailVerified: user.emailVerified,
      })
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (!foundUser) throw new Error("User not found");
    if (foundUser.emailVerified) throw new Error("Email is already verified");

    const otpCode = await otpService.generateOTP(email, "email_verification");
    await emailService.sendEmailVerification(email, foundUser.name, otpCode);
  }

  async verifyEmail(data: VerifyEmailDto): Promise<UserProfile> {
    const isValidOTP = await otpService.verifyOTP(
      data.email,
      data.otp,
      "email_verification",
    );
    if (!isValidOTP) throw new Error("Invalid or expired verification code");

    const [updatedUser] = await db
      .update(user)
      .set({ emailVerified: true, updatedAt: new Date() })
      .where(eq(user.email, data.email))
      .returning();

    if (!updatedUser) throw new Error("User not found");
    return { ...updatedUser, image: updatedUser.image || undefined };
  }

  async forgotPassword(data: ForgotPasswordDto): Promise<void> {
    // Fire and forget logic is applied in the controller, or we can make this fast:
    const [foundUser] = await db
      .select({ name: user.name })
      .from(user)
      .where(eq(user.email, data.email))
      .limit(1);
    if (!foundUser) return; // Silent fail for security

    const otpCode = await otpService.generateOTP(data.email, "password_reset");

    // Fire and forget email
    emailService
      .sendPasswordResetEmail(data.email, foundUser.name, otpCode)
      .catch((e) => console.error(e));
  }

  async resetPassword(data: ResetPasswordDto): Promise<void> {
    // OPTIMIZATION: Parallel execution of OTP check and Hashing
    // We optimistically hash the password while waiting for OTP verification (DB call)
    const [isValidOTP, hashedPassword] = await Promise.all([
      otpService.verifyOTP(data.email, data.otp, "password_reset"),
      bcrypt.hash(data.new_password, this.SALT_ROUNDS),
    ]);

    if (!isValidOTP) throw new Error("Invalid or expired reset code");

    // Execute DB updates
    // We can run the Password Update and the Session invalidation in parallel
    // or use a transaction. Parallel is fine here.
    const [foundUser] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, data.email))
      .limit(1);

    if (foundUser) {
      await Promise.all([
        db
          .update(user)
          .set({ password: hashedPassword, updatedAt: new Date() })
          .where(eq(user.email, data.email)),
        db.delete(session).where(eq(session.userId, foundUser.id)),
      ]);
    }
  }
}

export const authService = new AuthService();
