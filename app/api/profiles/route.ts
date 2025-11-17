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

export async function PUT(req: Request) {
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
    const {
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

    // Merge provided metadata with existing metadata
    const nextMetadata = {
      ...user.user_metadata,
      ...(name !== undefined ? { name } : {}),
      ...(surname !== undefined ? { surname } : {}),
      ...(userType !== undefined ? { user_type: userType } : {}),
      ...(address !== undefined ? { address } : {}),
      ...(city !== undefined ? { city } : {}),
      ...(country !== undefined ? { country } : {}),
      ...(latitude !== undefined ? { latitude } : {}),
      ...(longitude !== undefined ? { longitude } : {}),
      ...(postalCode !== undefined ? { postal_code: postalCode } : {}),
      ...(interests !== undefined ? { interests } : {}),
    };

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { user_metadata: nextMetadata }
    );

    if (error || !data.user) {
      console.error("Error updating profile:", error);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    const updated = data.user;

    return NextResponse.json({
      id: updated.id,
      email: updated.email,
      name: updated.user_metadata?.name || "",
      surname: updated.user_metadata?.surname || "",
      user_type: updated.user_metadata?.user_type || "Etudiant",
      address: updated.user_metadata?.address || "",
      city: updated.user_metadata?.city || "",
      country: updated.user_metadata?.country || "",
      latitude: updated.user_metadata?.latitude || null,
      longitude: updated.user_metadata?.longitude || null,
      postal_code: updated.user_metadata?.postal_code || "",
      interests: updated.user_metadata?.interests || [],
      created_at: updated.created_at,
    });
  } catch (error) {
    console.error("Unexpected error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
