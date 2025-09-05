const express = require("express");
const { OAuth2Client } = require("google-auth-library")
const jwt = require("jsonwebtoken");
const supabase = require("../utils/supabaseClient");
const { verifyUser } = require("../controllers/userData");
const {
  login,
  signup,
  logout,
  verifyEmail,
  resendVerificationEmail,
  googleIdSignIn
} = require("../controllers/auth");

const router = express.Router();


router.get("/verify", verifyUser);
router.get("/me", verifyUser); // Add /me endpoint for frontend compatibility

// Email verification routes
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

// Authentication routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.post("/google",googleIdSignIn);

module.exports = router;
