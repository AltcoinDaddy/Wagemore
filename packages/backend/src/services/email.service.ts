import nodemailer from "nodemailer";
import { env } from "../config";
import { readFileSync, existsSync } from "fs";
import { join, resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Resend } from "resend";

// Fix for ES modules - get __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface EmailConfig {
  from: string;
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private resend: Resend;
  private emailVerificationTemplate: string = "";
  private passwordResetTemplate: string = "";

  constructor() {
    // No more SMTP validation needed!
    this.resend = new Resend(env.RESEND_KEY);
    this.loadTemplates();
  }

  private validateConfig(): void {
    const requiredVars = [
      env.SMTP_HOST,
      env.SMTP_USER,
      env.SMTP_PASSWORD,
      env.SMTP_FROM,
    ];
    const missing = requiredVars.filter((value) => !value);

    if (missing.length > 0) {
      throw new Error(
        "Missing required SMTP environment variables. Check your .env file.",
      );
    }
  }

  private loadTemplates(): void {
    try {
      // Load email verification template
      this.loadEmailVerificationTemplate();

      // Load password reset template
      this.loadPasswordResetTemplate();

      console.log("✅ All email templates loaded successfully");
    } catch (error) {
      console.error("❌ Failed to load email templates:", error);
    }
  }

  private loadEmailVerificationTemplate(): void {
    const possiblePaths = [
      join(process.cwd(), "src", "views", "email-verification.html"),
      join(__dirname, "..", "views", "email-verification.html"),
      join(__dirname, "..", "..", "views", "email-verification.html"),
      resolve("src", "views", "email-verification.html"),
      resolve("packages", "backend", "src", "views", "email-verification.html"),
    ];

    let templatePath: string | null = null;

    console.log("🔍 Looking for email verification template in:");
    for (const path of possiblePaths) {
      console.log(`  - ${path} ${existsSync(path) ? "✅" : "❌"}`);
      if (existsSync(path)) {
        templatePath = path;
        break;
      }
    }

    if (templatePath) {
      this.emailVerificationTemplate = readFileSync(templatePath, "utf-8");
      console.log(
        `✅ Email verification template loaded from: ${templatePath}`,
      );
    } else {
      console.log("⚠️ Using fallback email verification template");
      this.emailVerificationTemplate =
        this.getFallbackEmailVerificationTemplate();
    }
  }

  private loadPasswordResetTemplate(): void {
    const possiblePaths = [
      join(process.cwd(), "src", "views", "reset-password.html"),
      join(__dirname, "..", "views", "reset-password.html"),
      join(__dirname, "..", "..", "views", "reset-password.html"),
      resolve("src", "views", "reset-password.html"),
      resolve("packages", "backend", "src", "views", "reset-password.html"),
    ];

    let templatePath: string | null = null;

    console.log("🔍 Looking for password reset template in:");
    for (const path of possiblePaths) {
      console.log(`  - ${path} ${existsSync(path) ? "✅" : "❌"}`);
      if (existsSync(path)) {
        templatePath = path;
        break;
      }
    }

    if (templatePath) {
      this.passwordResetTemplate = readFileSync(templatePath, "utf-8");
      console.log(`✅ Password reset template loaded from: ${templatePath}`);
    } else {
      console.log("⚠️ Using fallback password reset template");
      this.passwordResetTemplate = this.getFallbackPasswordResetTemplate();
    }
  }

  private getFallbackEmailVerificationTemplate(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .otp-code {
            background: #f8f9fa;
            border: 2px solid #4f46e5;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 3px;
            border-radius: 8px;
            color: #4f46e5;
        }
        .footer {
            background: #6b7280;
            color: white;
            padding: 15px;
            text-align: center;
            font-size: 12px;
            border-radius: 8px;
            margin-top: 20px;
        }
        h1 { margin: 0; font-size: 24px; }
        h2 { color: #1f2937; margin-top: 0; }
        .brand { color: #4f46e5; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Email Verification</h1>
        </div>
        <div class="content">
            <h2>Hello, {{USER_NAME}}!</h2>
            <p>Welcome to <span class="brand">FlowWager</span>! Please verify your email address to complete your registration.</p>

            <p><strong>Your verification code:</strong></p>
            <div class="otp-code">{{OTP_CODE}}</div>

            <p>This code will expire in <strong>10 minutes</strong> for security reasons.</p>

            <p>If you didn't create an account with us, please ignore this email.</p>

            <p>Best regards,<br><strong>The FlowWager Team</strong></p>
        </div>
        <div class="footer">
            <p>This is an automated email. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>`;
  }

  private getFallbackPasswordResetTemplate(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .otp-code {
            background: #fef2f2;
            border: 2px solid #dc2626;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 3px;
            border-radius: 8px;
            color: #dc2626;
        }
        .footer {
            background: #6b7280;
            color: white;
            padding: 15px;
            text-align: center;
            font-size: 12px;
            border-radius: 8px;
            margin-top: 20px;
        }
        .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px;
            margin: 15px 0;
            border-radius: 4px;
        }
        h1 { margin: 0; font-size: 24px; }
        h2 { color: #1f2937; margin-top: 0; }
        .brand { color: #dc2626; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔒 Password Reset Request</h1>
        </div>
        <div class="content">
            <h2>Hello, {{USER_NAME}}!</h2>
            <p>We received a request to reset your password for your <span class="brand">FlowWager</span> account. If you made this request, please use the code below:</p>

            <div class="otp-code">{{OTP_CODE}}</div>

            <div class="warning">
                <strong>Security Notice:</strong> This code will expire in 10 minutes. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
            </div>

            <p>For your security, please don't share this code with anyone.</p>

            <p>Best regards,<br><strong>The FlowWager Team</strong></p>
        </div>
        <div class="footer">
            <p>This is an automated email. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  async sendEmail(config: EmailConfig): Promise<void> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: "WageMore <onboarding@resend.dev>", // Must use this until you verify your domain
        to: config.to,
        subject: config.subject,
        html: config.html,
      });

      if (error) {
        console.error("❌ Resend Error:", error);
        throw new Error(error.message);
      }

      console.log(`✅ Email sent successfully via Resend. ID: ${data?.id}`);
    } catch (error: any) {
      console.error("❌ Email sending failed:", error);
      // Don't kill the process, just log it
    }
  }

  async sendEmailVerification(
    email: string,
    name: string,
    otp: string,
  ): Promise<void> {
    const html = this.getEmailVerificationTemplate(name, otp);

    await this.sendEmail({
      from: env.SMTP_FROM,
      to: email,
      subject: "Verify Your Email Address - Wagemore",
      html,
    });
  }

  async sendPasswordResetEmail(
    email: string,
    name: string,
    otp: string,
  ): Promise<void> {
    const html = this.getPasswordResetTemplate(name, otp);

    await this.sendEmail({
      from: env.SMTP_FROM,
      to: email,
      subject: "Reset Your Password - Wagemore",
      html,
    });
  }

  // // Test email connection
  // async testConnection(): Promise<boolean> {
  //   try {
  //     await this.transporter.verify();
  //     console.log("✅ SMTP connection verified successfully");
  //     return true;
  //   } catch (error) {
  //     console.error("❌ SMTP connection failed:", error);
  //     return false;
  //   }
  // }

  private getEmailVerificationTemplate(name: string, otp: string): string {
    // Check if we have the HTML template loaded
    if (
      this.emailVerificationTemplate &&
      this.emailVerificationTemplate.includes("Alex Johnson")
    ) {
      // Use your custom HTML template
      return this.emailVerificationTemplate
        .replace(/Alex Johnson/g, name)
        .replace(/789012/g, otp);
    } else {
      // Use fallback template with placeholders
      return this.emailVerificationTemplate
        .replace(/{{USER_NAME}}/g, name)
        .replace(/{{OTP_CODE}}/g, otp);
    }
  }

  private getPasswordResetTemplate(name: string, otp: string): string {
    // Check if we have the HTML template loaded
    if (
      this.passwordResetTemplate &&
      this.passwordResetTemplate.includes("Sarah Connor")
    ) {
      // Use your custom HTML template
      return this.passwordResetTemplate
        .replace(/Sarah Connor/g, name)
        .replace(/987654/g, otp);
    } else {
      // Use fallback template with placeholders
      return this.passwordResetTemplate
        .replace(/{{USER_NAME}}/g, name)
        .replace(/{{OTP_CODE}}/g, otp);
    }
  }
}

export const emailService = new EmailService();
