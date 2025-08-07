const jwt = require("jsonwebtoken");
const supabase = require("../utils/supabaseClient");


const verifyUser = async(req,res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
        return res
            .status(401)
            .json({ success: false, message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", decoded.email)
        .single();

        if (error || !user) {
        return res
            .status(401)
            .json({ success: false, message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("Auth error:", error);
        res.status(401).json({ success: false, message: "Invalid token" });
    }
}

module.exports = {
    verifyUser,
}