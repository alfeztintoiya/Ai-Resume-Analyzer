const supabase = require("./utils/supabaseClient");

async function testDatabaseVerification() {
  console.log("🔍 Testing database verification token storage...\n");

  try {
    // Check if we can read users table
    const { data: users, error: readError } = await supabase
      .from("users")
      .select(
        "id, email, is_verified, verification_token, verification_token_expiry"
      )
      .limit(5);

    if (readError) {
      console.error("❌ Error reading users table:", readError);
      return;
    }

    console.log("✅ Successfully connected to database");
    console.log("📊 Sample users in database:");
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Verified: ${user.is_verified}`);
      console.log(`   Token: ${user.verification_token ? "EXISTS" : "NULL"}`);
      console.log(
        `   Token Expiry: ${user.verification_token_expiry || "NULL"}`
      );
      console.log("");
    });

    // Test if we can find a user with a verification token
    const { data: tokenUsers, error: tokenError } = await supabase
      .from("users")
      .select("*")
      .not("verification_token", "is", null)
      .limit(3);

    if (tokenError) {
      console.error("❌ Error finding users with tokens:", tokenError);
    } else {
      console.log(
        `🔑 Found ${tokenUsers.length} users with verification tokens`
      );
      if (tokenUsers.length > 0) {
        console.log("Sample token user:");
        const user = tokenUsers[0];
        console.log(`- Email: ${user.email}`);
        console.log(`- Token: ${user.verification_token}`);
        console.log(`- Expires: ${user.verification_token_expiry}`);
        console.log(`- Verified: ${user.is_verified}`);
      }
    }
  } catch (error) {
    console.error("❌ Database test failed:", error);
  }
}

// Run the test
testDatabaseVerification().catch(console.error);
