const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const supabase = require("../utils/supabaseClient");
const { randomUUID } = require('crypto'); // For generating UUID

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:5003/api/v1/auth/google/callback",
        },

        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value;
                const firstName = profile.name?.givenName || profile.displayName?.split(' ')[0] || '';
                const lastName = profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '';
                const profilePic = profile.photos?.[0]?.value || null;
                
                const { data: userData, error: userError } = await supabase
                    .from("users")
                    .select("*")
                    .eq("email", email)
                    .single();

                if (userError && userError.code !== 'PGRST116') {
                    console.error("Database error:", userError);
                    return done(userError, null);
                }

                if (!userData) {
                    // Generate a unique ID manually
                    const userId = randomUUID();
                    
                    const { data: newUser, error: insertError } = await supabase
                        .from("users")
                        .insert([{
                            id: userId, // Manually set the ID
                            email: email,
                            first_name: firstName,
                            last_name: lastName,
                            profile_pic: profilePic,
                            password: 'GOOGLE_OAUTH',
                            is_verified: true,
                            username: email.split('@')[0],
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }])
                        .select()
                        .single();

                    if (insertError) {
                        console.error("Google signup error:", insertError);
                        return done(insertError, null);
                    }
                    
                    console.log("New Google user created:", newUser.email);
                    return done(null, newUser);
                } else {
                    console.log("Existing Google user logged in:", userData.email);
                    return done(null, userData);
                }
            } catch (error) {
                console.error("Google authentication error:", error);
                return done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    console.log("Serializing user:", user.email);
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", id)
            .single();
        
        if (error) {
            console.error("Deserialize user error:", error);
            return done(error, null);
        }
        
        console.log("Deserializing user:", user.email);
        done(null, user);
    } catch (error) {
        console.error("Deserialize user error:", error);
        done(error, null);
    }
});

module.exports = passport;