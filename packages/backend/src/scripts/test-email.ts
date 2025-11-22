import { emailService } from "../services/email.service";

async function testEmailService() {
  console.log("🧪 Testing email service...");

  try {
    // Test SMTP connection
    const connectionTest = await emailService.testConnection();
    if (!connectionTest) {
      console.error("❌ SMTP connection failed");
      return;
    }

    // Test email verification template
    console.log("📧 Testing email verification template...");
    await emailService.sendEmailVerification(
      "iagocech2056@gmail.com", // Replace with your email for testing
      "John Doe",
      "123456",
    );
    console.log("✅ Email verification template test sent!");

    // Wait a moment between emails
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Test password reset template
    console.log("📧 Testing password reset template...");
    await emailService.sendPasswordResetEmail(
      "iagocech2056@gmail.com", // Replace with your email for testing
      "John Doe",
      "654321",
    );
    console.log("✅ Password reset template test sent!");

    console.log("🎉 All email template tests completed!");
    console.log("📬 Check your email inbox for both test emails");
  } catch (error) {
    console.error("❌ Email test failed:", error);
  }
}

testEmailService();
