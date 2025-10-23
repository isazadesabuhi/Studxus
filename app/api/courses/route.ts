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

/**
 * POST /api/courses
 * Create a new course
 */
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

    // Verify the user token
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

    // Parse request body
    const body = await req.json();
    const {
      title,
      description,
      shortDescription,
      category,
      level,
      pricePerHour,
      maxParticipants,
    } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Validate price if provided
    if (pricePerHour !== undefined && pricePerHour !== null) {
      const price = Number(pricePerHour);
      if (isNaN(price) || price < 0) {
        return NextResponse.json(
          { error: "Price must be a positive number" },
          { status: 400 }
        );
      }
    }

    // Validate max participants if provided
    if (maxParticipants !== undefined && maxParticipants !== null) {
      const max = Number(maxParticipants);
      if (isNaN(max) || max < 1 || !Number.isInteger(max)) {
        return NextResponse.json(
          { error: "Max participants must be a positive integer" },
          { status: 400 }
        );
      }
    }

    // Validate level if provided
    const validLevels = ["Tous niveaux", "Débutant", "Intermédiaire", "Avancé"];
    if (level && !validLevels.includes(level)) {
      return NextResponse.json(
        {
          error: "Invalid level",
          validLevels: validLevels,
        },
        { status: 400 }
      );
    }

    // Create a client with the user's token for RLS
    const supabaseUser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Insert course into database using user's authenticated client
    const { data: course, error: insertError } = await supabaseUser
      .from("courses")
      .insert({
        user_id: user.id,
        title: title,
        description: description || null,
        short_description: shortDescription || null,
        category: category || null,
        level: level || null,
        price_per_hour:
          pricePerHour !== undefined ? Number(pricePerHour) : null,
        max_participants:
          maxParticipants !== undefined ? Number(maxParticipants) : 5,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating course:", insertError);
      return NextResponse.json(
        { error: "Failed to create course", details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Course created successfully",
        course: {
          id: course.id,
          userId: course.user_id,
          title: course.title,
          description: course.description,
          shortDescription: course.short_description,
          category: course.category,
          level: course.level,
          pricePerHour: course.price_per_hour,
          maxParticipants: course.max_participants,
          createdAt: course.created_at,
          updatedAt: course.updated_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unexpected error creating course:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/courses
 * Get all courses or filter by user
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const category = searchParams.get("category");
    const level = searchParams.get("level");

    // Select courses with author information using JOIN
    let query = supabaseAdmin
      .from("courses")
      .select(
        `
        *,
        profiles:user_id (
          id,
          name,
          surname,
          email,
          user_type
        )
      `
      )
      .order("created_at", { ascending: false });

    // Apply filters if provided
    if (userId) {
      query = query.eq("user_id", userId);
    }

    if (category) {
      query = query.eq("category", category);
    }

    if (level) {
      query = query.eq("level", level);
    }

    const { data: courses, error } = await query;

    if (error) {
      console.error("Error fetching courses:", error);
      return NextResponse.json(
        { error: "Failed to fetch courses" },
        { status: 500 }
      );
    }

    // Format response with author information
    const formattedCourses = courses.map((course) => ({
      id: course.id,
      userId: course.user_id,
      title: course.title,
      description: course.description,
      shortDescription: course.short_description,
      category: course.category,
      level: course.level,
      pricePerHour: course.price_per_hour,
      maxParticipants: course.max_participants,
      createdAt: course.created_at,
      updatedAt: course.updated_at,
      // Author information
      author: course.profiles
        ? {
            id: course.profiles.id,
            name: course.profiles.name,
            surname: course.profiles.surname,
            fullName: `${course.profiles.name} ${course.profiles.surname}`,
            email: course.profiles.email,
            userType: course.profiles.user_type,
          }
        : null,
    }));

    return NextResponse.json({
      success: true,
      courses: formattedCourses,
      count: formattedCourses.length,
    });
  } catch (error) {
    console.error("Unexpected error fetching courses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
