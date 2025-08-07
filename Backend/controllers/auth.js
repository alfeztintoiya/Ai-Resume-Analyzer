const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const supabase = require("../utils/supabaseClient");
const emailService = require("../utils/emailService");
const { randomUUID } = require("crypto");

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    // Check if user already exists
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    // Handle database errors (excluding "not found" which is expected)
    if (userError && userError.code !== "PGRST116") {
      console.error("Database Error (/controllers/auth.js):", userError);
      return res.status(500).json({
        success: false,
        message: "Database error occurred",
      });
    }

    if (existingUser) {
      return res.status(500).json({
        success: false,
        message: "User with this email already exists.",
      });
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const userId = randomUUID();

    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          id: userId,
          email: email,
          name: name,
          password: hashedPassword,
          is_verified: false,
          verification_token: verificationToken,
          verification_token_expiry: verificationTokenExpiry.toISOString(),
          username: email.split("@")[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.log("User creation error: ", insertError);
      return res.status(500).json({
        success: false,
        message: "Failed to create user account",
      });
    }

    // Send verification email
    const emailResult = await emailService.sendVerificationEmail(
      newUser.email,
      newUser.name,
      verificationToken
    );

    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error);
      // Continue with registration even if email fails
    }

    // Don't create session until email is verified - user must verify email first
    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message:
        "Account created successfully. Please check your email to verify your account.",
      user: userWithoutPassword,
      emailSent: emailResult.success,
    });
  } catch (error) {
    console.error("Signup error: ", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required",
      });
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (userError || !user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.password || user.password === "GOOGLE_OAUTH") {
      return res.status(401).json({
        success: false,
        message:
          "This account was created with Google. Please sign with Google.",
      });
    }

    // Check if user's email is verified
    if (!user.is_verified) {
      return res.status(401).json({
        success: false,
        message:
          "Please verify your email address before logging in. Check your inbox for the verification link.",
      });
    }

    // Compare password directly (don't hash the input password again)
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role || "USER",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: "Login Successful",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.log("Login error: ", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error: ", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    // Find user with this verification token
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("verification_token", token)
      .single();

    if (userError || !user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    // Check if token has expired
    const tokenExpiry = new Date(user.verification_token_expiry);
    if (tokenExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message:
          "Verification token has expired. Please request a new verification email.",
      });
    }

    // Check if user is already verified
    if (user.is_verified) {
      return res.status(200).json({
        success: true,
        message: "Email is already verified",
      });
    }

    // Update user to verified and clear verification token
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({
        is_verified: true,
        verification_token: null,
        verification_token_expiry: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Email verification update error:", updateError);
      return res.status(500).json({
        success: false,
        message: "Failed to verify email",
      });
    }

    // Create JWT token for the newly verified user
    const jwtToken = jwt.sign(
      {
        userId: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role || "USER",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set secure cookie
    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser;

    res.status(200).json({
      success: true,
      message: "Email verified successfully! You are now logged in.",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is already verified
    if (user.is_verified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new verification token
    const { error: updateError } = await supabase
      .from("users")
      .update({
        verification_token: verificationToken,
        verification_token_expiry: verificationTokenExpiry.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Update verification token error:", updateError);
      return res.status(500).json({
        success: false,
        message: "Failed to generate new verification token",
      });
    }

    // Send verification email
    const emailResult = await emailService.sendVerificationEmail(
      user.email,
      user.name,
      verificationToken
    );

    if (!emailResult.success) {
      console.error("Failed to resend verification email:", emailResult.error);
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email",
      });
    }

    res.status(200).json({
      success: true,
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.error("Resend verification email error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  signup,
  login,
  logout,
  verifyEmail,
  resendVerificationEmail,
};
