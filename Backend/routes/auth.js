const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const supabase = require("../utils/supabaseClient");
const { verifyUser } = require("../controllers/userData");
const {
  login,
  signup,
  logout,
  verifyEmail,
  resendVerificationEmail,
} = require("../controllers/auth");

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    const token = jwt.sign(
      {
        userId: req.user.id,
        email: req.user.email,
        role: req.user.role || "USER",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect("http://localhost:5173");
  }
);

router.get("/verify", verifyUser);
router.get("/me", verifyUser); // Add /me endpoint for frontend compatibility

// Email verification routes
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

// Authentication routes
router.post("/signup", signup);
router.get("/login", login);
router.post("/logout", logout);

module.exports = router;
