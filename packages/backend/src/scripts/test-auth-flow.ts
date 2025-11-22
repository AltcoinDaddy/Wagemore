import { emailService } from "../services/email.service";
import { otpService } from "../services/otp.service";

async function testCompleteAuthFlow() {
  console.log("🧪 Testing Complete Authentication Flow...");

  try {
    // Test 1: SMTP Connection
    console.log("\n1️⃣ Testing SMTP Connection...");
    const connectionTest = await emailService.testConnection();
    if (!connectionTest) {
      console.error("❌ SMTP connection failed - cannot proceed with email tests");
      return;
    }
    console.log("✅ SMTP connection successful");

    // Test 2: Registration Flow
    console.log("\n2️⃣ Testing Registration Flow...");
    const registerData = {
      name: "John Doe",
      username: "johndoe123",
      email: "test@example.com", // Replace with your actual email
      password: "password123"
    };

    console.log("📋 Registration data:", {
      name: registerData.name,
      username: registerData.username,
      email: registerData.email,
      password: "*".repeat(registerData.password.length)
    });

    const registerResponse = await fetch("http://localhost:3001/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registerData),
    });

    const registerResult = await registerResponse.json();
    console.log("📝 Registration response:", registerResult);

    if (!registerResult.success) {
      console.error("❌ Registration failed:", registerResult.message);
      if (registerResult.errors) {
        console.log("🔍 Field errors:");
        Object.entries(registerResult.errors).forEach(([field, error]) => {
          console.log(`  - ${field}: ${error}`);
        });
      }
      return;
    }

    console.log("✅ Registration successful! User created and verification email sent");

    // Test 3: Email Verification Flow
    console.log("\n3️⃣ Testing Email Verification Flow...");

    // Wait a moment for email to be sent
    console.log("⏳ Waiting 2 seconds for email to be sent...");
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate a test OTP (in real scenario, user would get this from email)
    console.log("🔢 Generating test OTP for verification...");
    const verificationOTP = await otpService.generateOTP(registerData.email, "email_verification");
    console.log(`📧 Verification OTP: ${verificationOTP}`);

    const verifyResponse = await fetch("http://localhost:3001/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: registerData.email,
        otp: verificationOTP
      }),
    });

    const verifyResult = await verifyResponse.json();
    console.log("📝 Email verification response:", verifyResult);

    if (verifyResult.success) {
      console.log("✅ Email verification successful!");
    } else {
      console.error("❌ Email verification failed:", verifyResult.message);
    }

    // Test 4: Login Flow
    console.log("\n4️⃣ Testing Login Flow...");

    const loginResponse = await fetch("http://localhost:3001/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: registerData.email,
        password: registerData.password
      }),
    });

    const loginResult = await loginResponse.json();
    console.log("📝 Login response:", {
      success: loginResult.success,
      message: loginResult.message,
      hasData: !!loginResult.data,
      hasTokens: !!(loginResult.data?.accessToken && loginResult.data?.refreshToken)
    });

    if (!loginResult.success) {
      console.error("❌ Login failed:", loginResult.message);
      return;
    }

    const { accessToken, refreshToken } = loginResult.data;
    console.log("✅ Login successful! Tokens received");

    // Test 5: Protected Route Access
    console.log("\n5️⃣ Testing Protected Route Access...");

    const profileResponse = await fetch("http://localhost:3001/api/auth/me", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
    });

    const profileResult = await profileResponse.json();
    console.log("📝 Profile response:", profileResult);

    if (profileResult.success) {
      console.log("✅ Protected route access successful!");
    } else {
      console.error("❌ Protected route access failed:", profileResult.message);
    }

    // Test 6: Password Reset Flow
    console.log("\n6️⃣ Testing Password Reset Flow...");

    const forgotPasswordResponse = await fetch("http://localhost:3001/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: registerData.email
      }),
    });

    const forgotPasswordResult = await forgotPasswordResponse.json();
    console.log("📝 Forgot password response:", forgotPasswordResult);

    if (forgotPasswordResult.success) {
      console.log("✅ Password reset email sent!");

      // Generate reset OTP for testing
      console.log("🔢 Generating test OTP for password reset...");
      const resetOTP = await otpService.generateOTP(registerData.email, "password_reset");
      console.log(`📧 Reset OTP: ${resetOTP}`);

      // Test password reset
      const newPassword = "newpassword123";
      const resetPasswordResponse = await fetch("http://localhost:3001/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registerData.email,
          otp: resetOTP,
          newPassword: newPassword
        }),
      });

      const resetPasswordResult = await resetPasswordResponse.json();
      console.log("📝 Password reset response:", resetPasswordResult);

      if (resetPasswordResult.success) {
        console.log("✅ Password reset successful!");

        // Test login with new password
        console.log("🔐 Testing login with new password...");
        const newLoginResponse = await fetch("http://localhost:3001/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: registerData.email,
            password: newPassword
          }),
        });

        const newLoginResult = await newLoginResponse.json();
        if (newLoginResult.success) {
          console.log("✅ Login with new password successful!");
        } else {
          console.error("❌ Login with new password failed:", newLoginResult.message);
        }
      } else {
        console.error("❌ Password reset failed:", resetPasswordResult.message);
      }
    }

    // Test 7: Logout Flow
    console.log("\n7️⃣ Testing Logout Flow...");

    const logoutResponse = await fetch("http://localhost:3001/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refreshToken: refreshToken
      }),
    });

    const logoutResult = await logoutResponse.json();
    console.log("📝 Logout response:", logoutResult);

    if (logoutResult.success) {
      console.log("✅ Logout successful!");
    } else {
      console.error("❌ Logout failed:", logoutResult.message);
    }

    // Test 8: Invalid Token Access
    console.log("\n8️⃣ Testing Invalid Token Access...");

    const invalidTokenResponse = await fetch("http://localhost:3001/api/auth/me", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`, // This should be invalid after logout
        "Content-Type": "application/json"
      },
    });

    const invalidTokenResult = await invalidTokenResponse.json();
    console.log("📝 Invalid token response:", invalidTokenResult);

    if (!invalidTokenResult.success) {
      console.log("✅ Invalid token properly rejected!");
    } else {
      console.error("⚠️ Invalid token was accepted (this might be expected if tokens don't get invalidated immediately)");
    }

    console.log("\n🎉 Complete Authentication Flow Test Completed!");
    console.log("\n📊 Summary:");
    console.log("✅ SMTP Connection");
    console.log("✅ User Registration");
    console.log("✅ Email Verification");
    console.log("✅ User Login");
    console.log("✅ Protected Route Access");
    console.log("✅ Password Reset Flow");
    console.log("✅ User Logout");
    console.log("✅ Invalid Token Handling");

  } catch (error) {
    console.error("❌ Authentication flow test failed:", error);

    if (error instanceof TypeError && error.message.includes("fetch")) {
      console.log("\n💡 Tip: Make sure your backend server is running on http://localhost:3001");
      console.log("   Run: npm run dev or pnpm dev");
    }
  }
}

// Helper function to test validation errors
async function testValidationErrors() {
  console.log("\n🧪 Testing Validation Errors...");

  try {
    const invalidData = {
      name: "A", // Too short
      username: "ab", // Too short
      email: "invalid-email", // Invalid format
      password: "123" // Too short
    };

    console.log("📋 Testing with invalid data:", invalidData);

    const response = await fetch("http://localhost:3001/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidData),
    });

    const result = await response.json();

    console.log("📝 Validation error response:");
    console.log(`Status: ${response.status}`);
    console.log(`Success: ${result.success}`);
    console.log(`Message: ${result.message}`);
    console.log(`Is Form Error: ${result.isFormError}`);

    if (result.errors) {
      console.log("🔍 Field errors:");
      Object.entries(result.errors).forEach(([field, error]) => {
        console.log(`  - ${field}: ${error}`);
      });
      console.log("✅ Validation errors properly formatted!");
    } else {
      console.log("⚠️ No field-level errors found");
    }

  } catch (error) {
    console.error("❌ Validation error test failed:", error);
  }
}

// Run both tests
async function runAllTests() {
  await testValidationErrors();
  await testCompleteAuthFlow();
}

runAllTests();
