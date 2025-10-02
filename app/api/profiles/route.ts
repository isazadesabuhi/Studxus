import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service role client (server-side only)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * GET - Fetch user profile
 */
export async function GET(req: Request) {
  try {
    // Get the authorization header
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify the token and get the user
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Return user profile data
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || "",
      surname: user.user_metadata?.surname || "",
      user_type: user.user_metadata?.user_type || "Etudiant",
      created_at: user.created_at,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST - Create user profile (called after signup)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, email, name, surname, userType } = body;

    // Validate required fields
    if (!userId || !email || !name || !surname || !userType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update user metadata using service role
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          name,
          surname,
          user_type: userType,
        },
      }
    );

    if (error) {
      console.error("Error creating profile:", error);
      return NextResponse.json(
        { error: "Failed to create profile" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        profile: {
          id: data.user.id,
          email: data.user.email,
          name,
          surname,
          user_type: userType,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
