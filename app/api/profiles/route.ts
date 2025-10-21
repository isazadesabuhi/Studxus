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

export async function GET(req: Request) {
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

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || "",
      surname: user.user_metadata?.surname || "",
      user_type: user.user_metadata?.user_type || "Etudiant",
      address: user.user_metadata?.address || "",
      city: user.user_metadata?.city || "",
      country: user.user_metadata?.country || "",
      latitude: user.user_metadata?.latitude || null,
      longitude: user.user_metadata?.longitude || null,
      postal_code: user.user_metadata?.postal_code || "",
      interests: user.user_metadata?.interests || [],
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      email,
      name,
      surname,
      userType,
      address,
      city,
      country,
      latitude,
      longitude,
      postalCode,
      interests,
    } = body;

    if (!userId || !email || !name || !surname || !userType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          name,
          surname,
          user_type: userType,
          address: address || "",
          city: city || "",
          country: country || "",
          latitude: latitude || null,
          longitude: longitude || null,
          postal_code: postalCode || "",
          interests: interests || [],
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
          address: address || "",
          city: city || "",
          country: country || "",
          latitude: latitude || null,
          longitude: longitude || null,
          postal_code: postalCode || "",
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
