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
 * Sign up a new user with magic link
 * Uses service role for admin operations
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, surname, userType } = body;

    // Validate required fields
    if (!email || !name || !surname || !userType) {
      return NextResponse.json(
        {
          error: "Missing required fields: email, name, surname, userType",
        },
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

    // Validate userType
    if (!["Professeur", "Etudiant"].includes(userType)) {
      return NextResponse.json(
        { error: "userType must be either 'Professeur' or 'Etudiant'" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUsers, error: checkError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (checkError) {
      console.error("Error checking existing users:", checkError);
      return NextResponse.json(
        { error: "Failed to verify user" },
        { status: 500 }
      );
    }

    const userExists = existingUsers.users.some(
      (user) => user.email?.toLowerCase() === email.toLowerCase()
    );

    if (userExists) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Create user with metadata using service role
    const { data: signUpData, error: signUpError } =
      await supabaseAdmin.auth.admin.createUser({
        email: email,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          name: name,
          surname: surname,
          user_type: userType,
        },
      });

    if (signUpError) {
      console.error("Error creating user:", signUpError);
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // Send magic link using Supabase's built-in email service
    const { error: magicLinkError } = await supabaseAdmin.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/accueil`,
      },
    });

    if (magicLinkError) {
      console.error("Error sending magic link:", magicLinkError);
      // User is created but magic link failed
      return NextResponse.json(
        {
          warning:
            "User created but failed to send magic link. Please request a new link.",
          userId: signUpData.user.id,
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully. Magic link sent to email.",
        userId: signUpData.user.id,
        email: email,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unexpected error during signup:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
