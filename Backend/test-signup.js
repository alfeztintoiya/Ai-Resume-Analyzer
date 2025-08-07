const express = require("express");
const { signup } = require("./controllers/auth");

// Create a test signup request
async function testSignup() {
  console.log("🧪 Testing signup with verification token...\n");

  // Mock request and response objects
  const req = {
    body: {
      name: "Test User",
      email: "test-verification@example.com",
      password: "testPassword123",
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
      console.log(`🍪 Cookie Set: ${name} = ${value}`);
      return this;
    },
  };

  try {
    await signup(req, res);
  } catch (error) {
    console.error("❌ Signup test failed:", error);
  }
}

testSignup().catch(console.error);
