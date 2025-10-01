// app/api/auth/signin/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service role client (server-side only)
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
 * Send magic link to existing user
 * Uses service role for admin operations
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required and must be a string" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: users, error: checkError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (checkError) {
      console.error("Error checking user:", checkError);
      return NextResponse.json(
        { error: "Failed to verify user" },
        { status: 500 }
      );
    }

    const userExists = users.users.some(
      (user) => user.email?.toLowerCase() === email.toLowerCase()
    );

    if (!userExists) {
      // Security: Don't reveal whether user exists or not
      // Return success message even if user doesn't exist
      return NextResponse.json({
        success: true,
        message: "If this email is registered, a magic link has been sent.",
      });
    }

    // Send magic link using service role
    const { error: magicLinkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/profile`,
        },
      });

    if (magicLinkError) {
      console.error("Error sending magic link:", magicLinkError);
      return NextResponse.json(
        { error: "Failed to send magic link" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Magic link sent successfully. Check your email.",
    });
  } catch (error) {
    console.error("Unexpected error during signin:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}