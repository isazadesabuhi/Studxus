import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

// Default available interests
const AVAILABLE_INTERESTS = [
  "math",
  "sport",
  "music",
  "art",
  "science",
  "technology",
  "literature",
  "cooking",
  "language",
  "history",
];

// GET user's interests (or all available interests if no auth)
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    // If no auth header, return available interests
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({
        available_interests: AVAILABLE_INTERESTS,
      });
    }

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      // If token is invalid, still return available interests
      return NextResponse.json({
        available_interests: AVAILABLE_INTERESTS,
      });
    }

    // Get user's selected interests
    const userInterests = user.user_metadata?.interests || [];

    return NextResponse.json({
      available_interests: AVAILABLE_INTERESTS,
      user_interests: userInterests,
      userId: user.id,
    });
  } catch (error) {
    console.error("Error fetching interests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST/PUT update user's interests
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

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

    const body = await req.json();
    const { interests } = body;

    // Validate interests
    if (!Array.isArray(interests)) {
      return NextResponse.json(
        { error: "Interests must be an array" },
        { status: 400 }
      );
    }

    // Validate that all interests are from available list
    const invalidInterests = interests.filter(
      (interest) => !AVAILABLE_INTERESTS.includes(interest)
    );

    if (invalidInterests.length > 0) {
      return NextResponse.json(
        {
          error: "Invalid interests provided",
          invalid: invalidInterests,
          available: AVAILABLE_INTERESTS,
        },
        { status: 400 }
      );
    }

    // Update user metadata with interests
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          interests,
        },
      }
    );

    if (error) {
      console.error("Error updating user interests:", error);
      return NextResponse.json(
        { error: "Failed to update interests" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      userId: user.id,
      interests,
    });
  } catch (error) {
    console.error("Unexpected error updating interests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
