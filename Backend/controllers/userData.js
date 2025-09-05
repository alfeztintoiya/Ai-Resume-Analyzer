const jwt = require("jsonwebtoken");
const supabase = require("../utils/supabaseClient");

const verifyUser = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ authenticated: false, user: null });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { data: user, error } = await supabase
      .from("users")
      .select("id,email,name,is_verified,role,avatar_url")
      .eq("id", decoded.userId)
      .maybeSingle();

    if (error || !user) {
      return res.status(401).json({ authenticated: false, user: null });
    }

    return res.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatar_url || null,
        emailVerified: !!user.is_verified,
        role: user.role || "USER",
      },
    });
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ authenticated: false, user: null });
  }
};

module.exports = {
  verifyUser,
};
