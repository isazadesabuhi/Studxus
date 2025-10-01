import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ⚠️ CRITICAL: Use service_role key, NOT anon key
// This should ONLY be used in server-side code (API routes)
// NEVER expose service_role key to the frontend
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // 🔑 Service role key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Check if a user exists by email
 * Uses service role to safely query auth.users
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    // Validate input
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required and must be a string" },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Query auth.users using service role (has permission)
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error("Error checking user:", error);
      return NextResponse.json(
        { error: "Failed to check user existence" },
        { status: 500 }
      );
    }

    // Check if user exists with this email
    const userExists = data.users.some(
      (user) => user.email?.toLowerCase() === email.toLowerCase()
    );

    return NextResponse.json({
      exists: userExists,
      email: email,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Alternative: GET method for query parameter approach
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email query parameter is required" },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Query auth.users using service role
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error("Error checking user:", error);
      return NextResponse.json(
        { error: "Failed to check user existence" },
        { status: 500 }
      );
    }

    // Check if user exists
    const userExists = data.users.some(
      (user) => user.email?.toLowerCase() === email.toLowerCase()
    );

    return NextResponse.json({
      exists: userExists,
      email: email,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
