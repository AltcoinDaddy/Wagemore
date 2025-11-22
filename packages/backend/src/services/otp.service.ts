import { db } from "../db";
import { otp } from "../db/schema";
import { eq, and } from "drizzle-orm";

export type OTPType = "email_verification" | "password_reset";

class OTPService {
  private generateOTPCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async generateOTP(email: string, type: OTPType): Promise<string> {
    try {
      // Delete any existing unused OTPs for this email and type
      await db
        .delete(otp)
        .where(
          and(eq(otp.email, email), eq(otp.type, type), eq(otp.used, false)),
        );

      // Generate new OTP
      const otpCode = this.generateOTPCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store OTP in database
      await db.insert(otp).values({
        id: crypto.randomUUID(),
        email,
        code: otpCode,
        type,
        expiresAt,
        used: false,
      });

      console.log(`✅ Generated OTP ${otpCode} for ${email} (${type})`);
      return otpCode;
    } catch (error) {
      console.error("❌ OTP generation error:", error);
      throw new Error("Failed to generate OTP");
    }
  }

  async verifyOTP(
    email: string,
    otpCode: string,
    type: OTPType,
  ): Promise<boolean> {
    try {
      const [foundOTP] = await db
        .select()
        .from(otp)
        .where(
          and(
            eq(otp.email, email),
            eq(otp.code, otpCode),
            eq(otp.type, type),
            eq(otp.used, false),
          ),
        )
        .limit(1);

      if (!foundOTP) {
        console.log(`❌ OTP not found for ${email}: ${otpCode}`);
        return false;
      }

      // Check if OTP is expired
      if (foundOTP.expiresAt < new Date()) {
        console.log(`❌ OTP expired for ${email}: ${otpCode}`);
        // Delete expired OTP
        await db.delete(otp).where(eq(otp.id, foundOTP.id));
        return false;
      }

      // Mark OTP as used
      await db.update(otp).set({ used: true }).where(eq(otp.id, foundOTP.id));

      console.log(`✅ OTP verified successfully for ${email}: ${otpCode}`);
      return true;
    } catch (error) {
      console.error("❌ OTP verification error:", error);
      return false;
    }
  }

  async cleanupExpiredOTPs(): Promise<void> {
    try {
      await db.delete(otp).where(eq(otp.expiresAt, new Date()));
      console.log("✅ Cleaned up expired OTPs");
    } catch (error) {
      console.error("❌ OTP cleanup error:", error);
    }
  }
}

export const otpService = new OTPService();
