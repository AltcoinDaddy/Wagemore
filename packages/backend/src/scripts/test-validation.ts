import { registerSchema, loginSchema, verifyEmailSchema, resetPasswordSchema } from "../features/auth/auth.dto";

async function testValidationSchemas() {
  console.log("🧪 Testing Validation Schemas...");

  // Test 1: Valid registration data
  console.log("\n1️⃣ Testing valid registration data...");
  try {
    const validRegisterData = {
      name: "John Doe",
      username: "johndoe123",
      email: "john@example.com",
      password: "password123"
    };

    const result = registerSchema.parse(validRegisterData);
    console.log("✅ Valid registration data passed:", result);
  } catch (error) {
    console.error("❌ Valid registration data failed:", error);
  }

  // Test 2: Invalid registration data
  console.log("\n2️⃣ Testing invalid registration data...");
  try {
    const invalidRegisterData = {
      name: "A", // Too short
      username: "ab", // Too short
      email: "invalid-email", // Invalid format
      password: "123" // Too short
    };

    registerSchema.parse(invalidRegisterData);
    console.log("❌ Invalid data should have failed but passed");
  } catch (error: any) {
    console.log("✅ Invalid registration data properly rejected");
    if (error.errors) {
      console.log("📝 Validation errors:");
      error.errors.forEach((err: any) => {
        console.log(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
  }

  // Test 3: Valid login data
  console.log("\n3️⃣ Testing valid login data...");
  try {
    const validLoginData = {
      email: "john@example.com",
      password: "password123"
    };

    const result = loginSchema.parse(validLoginData);
    console.log("✅ Valid login data passed:", result);
  } catch (error) {
    console.error("❌ Valid login data failed:", error);
  }

  // Test 4: Invalid login data
  console.log("\n4️⃣ Testing invalid login data...");
  try {
    const invalidLoginData = {
      email: "invalid-email",
      password: "123" // Too short
    };

    loginSchema.parse(invalidLoginData);
    console.log("❌ Invalid login data should have failed but passed");
  } catch (error: any) {
    console.log("✅ Invalid login data properly rejected");
    if (error.errors) {
      console.log("📝 Validation errors:");
      error.errors.forEach((err: any) => {
        console.log(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
  }

  // Test 5: Valid email verification data
  console.log("\n5️⃣ Testing valid email verification data...");
  try {
    const validVerifyData = {
      email: "john@example.com",
      otp: "123456"
    };

    const result = verifyEmailSchema.parse(validVerifyData);
    console.log("✅ Valid email verification data passed:", result);
  } catch (error) {
    console.error("❌ Valid email verification data failed:", error);
  }

  // Test 6: Invalid OTP length
  console.log("\n6️⃣ Testing invalid OTP length...");
  try {
    const invalidOtpData = {
      email: "john@example.com",
      otp: "123" // Too short
    };

    verifyEmailSchema.parse(invalidOtpData);
    console.log("❌ Invalid OTP length should have failed but passed");
  } catch (error: any) {
    console.log("✅ Invalid OTP length properly rejected");
    if (error.errors) {
      console.log("📝 Validation errors:");
      error.errors.forEach((err: any) => {
        console.log(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
  }

  // Test 7: Valid password reset data
  console.log("\n7️⃣ Testing valid password reset data...");
  try {
    const validResetData = {
      email: "john@example.com",
      otp: "123456",
      newPassword: "newpassword123"
    };

    const result = resetPasswordSchema.parse(validResetData);
    console.log("✅ Valid password reset data passed:", result);
  } catch (error) {
    console.error("❌ Valid password reset data failed:", error);
  }

  console.log("\n🎉 Validation schema tests completed!");
}

// Test Zod error formatting
async function testZodErrorFormatting() {
  console.log("\n🧪 Testing Zod Error Formatting...");

  try {
    const { createZodErrorResponse } = await import("../utils/zod-error-formatter");

    // Create invalid data to trigger multiple validation errors
    const invalidData = {
      name: "",
      username: "ab",
      email: "not-an-email",
      password: "123"
    };

    try {
      registerSchema.parse(invalidData);
    } catch (zodError: any) {
      console.log("📝 Raw Zod Error:");
      console.log(JSON.stringify(zodError.errors, null, 2));

      const formattedError = createZodErrorResponse(zodError);
      console.log("\n✨ Formatted Error Response:");
      console.log(JSON.stringify(formattedError, null, 2));

      console.log("✅ Error formatting working correctly!");
    }
  } catch (error) {
    console.error("❌ Error formatting test failed:", error);
  }
}

// Run all tests
async function runTests() {
  await testValidationSchemas();
  await testZodErrorFormatting();
}

runTests();
