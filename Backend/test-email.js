const emailService = require("./utils/emailService");

// Test email verification functionality
async function testEmailVerification() {
  console.log("Testing email verification system...");

  // Test email service connection
  const isConnected = await emailService.testConnection();
  console.log("Email service connection:", isConnected ? "SUCCESS" : "FAILED");

  if (isConnected) {
    // Test sending verification email
    const testEmail = "test@example.com";
    const testName = "Test User";
    const testToken = "sample-verification-token-123";

    console.log("\nSending test verification email...");
    const result = await emailService.sendVerificationEmail(
      testEmail,
      testName,
      testToken
    );

    if (result.success) {
      console.log("✅ Verification email sent successfully!");
      console.log("Email details:", {
        to: testEmail,
        subject: "Verify Your Email - Resume Analyzer",
        token: testToken,
      });
    } else {
      console.log("❌ Failed to send verification email:", result.error);
    }
  }
}

// Run the test
testEmailVerification().catch(console.error);
