const { verifyEmail } = require("./controllers/auth");

// Test email verification with the token we just created
async function testEmailVerification() {
  console.log("🔐 Testing email verification endpoint...\n");

  // Use the token from our test user
  const testToken =
    "a4769293dd411e39770e7d694b523a10fb5c86b953b23926bf958fc085d65a0b";

  // Mock request and response objects
  const req = {
    query: {
      token: testToken,
    },
  };

  const res = {
    status: function (code) {
      this.statusCode = code;
      return this;
    },
    json: function (data) {
      console.log(`📤 Response Status: ${this.statusCode}`);
      console.log("📄 Response Data:", JSON.stringify(data, null, 2));
      return this;
    },
    cookie: function (name, value, options) {
      console.log(`🍪 Cookie Set: ${name} = ${value.substring(0, 50)}...`);
      return this;
    },
  };

  try {
    await verifyEmail(req, res);
  } catch (error) {
    console.error("❌ Email verification test failed:", error);
  }
}

testEmailVerification().catch(console.error);
