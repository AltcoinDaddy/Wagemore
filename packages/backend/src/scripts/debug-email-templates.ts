import { readFileSync, existsSync } from "fs";
import { join } from "path";

async function debugEmailTemplates() {
  console.log("🔍 Debugging email templates...");

  // Check if files exist
  const emailVerificationPath = join(process.cwd(), "src", "views", "email-verification.html");
  const passwordResetPath = join(process.cwd(), "src", "views", "reset-password.html");

  console.log("\n📁 File existence check:");
  console.log(`Email verification: ${emailVerificationPath} ${existsSync(emailVerificationPath) ? '✅' : '❌'}`);
  console.log(`Password reset: ${passwordResetPath} ${existsSync(passwordResetPath) ? '✅' : '❌'}`);

  if (existsSync(passwordResetPath)) {
    try {
      const content = readFileSync(passwordResetPath, "utf-8");

      console.log("\n📊 Template analysis:");
      console.log(`File size: ${content.length} characters`);
      console.log(`Contains "Sarah Connor": ${content.includes("Sarah Connor")}`);
      console.log(`Contains "987654": ${content.includes("987654")}`);

      // Check for these specific strings
      const patterns = [
        "Password Reset Request",
        "Sarah Connor",
        "987654",
        "Wagemore",
        "verification code"
      ];

      console.log("\n🔍 Pattern search:");
      patterns.forEach(pattern => {
        const found = content.includes(pattern);
        console.log(`  "${pattern}": ${found ? '✅' : '❌'}`);
      });

      // Show a small sample of the content
      console.log("\n📝 Content preview (first 200 chars):");
      console.log(content.substring(0, 200) + "...");

      // Test replacement
      console.log("\n🔄 Testing replacement:");
      const testReplacement = content
        .replace(/Sarah Connor/g, "TEST_USER")
        .replace(/987654/g, "TEST_OTP");

      const replacementWorked = testReplacement.includes("TEST_USER") && testReplacement.includes("TEST_OTP");
      console.log(`Replacement worked: ${replacementWorked ? '✅' : '❌'}`);

      if (replacementWorked) {
        console.log("✅ Template replacement should work correctly");
      } else {
        console.log("❌ Template replacement failed - checking for exact matches...");

        // Find the actual name in the template
        const nameMatch = content.match(/Hello[^>]*>([^<]+)</);
        const codeMatch = content.match(/(\d{6})/);

        if (nameMatch) console.log(`Found name pattern: "${nameMatch[1]}"`);
        if (codeMatch) console.log(`Found code pattern: "${codeMatch[1]}"`);
      }

    } catch (error) {
      console.error("❌ Error reading template:", error);
    }
  }

  // Check email verification template too
  if (existsSync(emailVerificationPath)) {
    try {
      const content = readFileSync(emailVerificationPath, "utf-8");

      console.log("\n📊 Email verification template analysis:");
      console.log(`File size: ${content.length} characters`);
      console.log(`Contains "Alex Johnson": ${content.includes("Alex Johnson")}`);
      console.log(`Contains "789012": ${content.includes("789012")}`);

      const patterns = [
        "Email Verification Required",
        "Alex Johnson",
        "789012",
        "Wagemore",
        "verification code"
      ];

      console.log("\n🔍 Email verification pattern search:");
      patterns.forEach(pattern => {
        const found = content.includes(pattern);
        console.log(`  "${pattern}": ${found ? '✅' : '❌'}`);
      });

    } catch (error) {
      console.error("❌ Error reading email verification template:", error);
    }
  }
}

debugEmailTemplates();
