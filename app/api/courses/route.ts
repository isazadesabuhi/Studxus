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
      sessionDate,
      startTime,
      endTime,
      sessions,
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

    // Validate session scheduling fields
    const hasPartialSessionFields = sessionDate || startTime || endTime;
    if (hasPartialSessionFields) {
      if (!sessionDate || !startTime || !endTime) {
        return NextResponse.json(
          {
            error:
              "sessionDate, startTime, and endTime must all be provided together",
          },
          { status: 400 }
        );
      }
    }

    // Validate level if provided
    const validLevels = ["Débutant", "Intermédiaire", "Avancé"];
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
        sessions: sessions || [],
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

    let createdSession = null;

    if (sessionDate && startTime && endTime) {
      const { data: session, error: sessionError } = await supabaseUser
        .from("course_sessions")
        .insert({
          course_id: course.id,
          session_date: sessionDate,
          start_time: startTime,
          end_time: endTime,
          max_participants:
            maxParticipants !== undefined ? Number(maxParticipants) : 5,
          sessions: sessions || [],
        })
        .select()
        .single();

      if (sessionError) {
        console.error("Error creating initial course session:", sessionError);
        return NextResponse.json(
          {
            error: "Course created but failed to create session schedule",
            details: sessionError.message,
          },
          { status: 500 }
        );
      }

      createdSession = session;
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
          sessions: course.sessions || [],
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
        ),
        course_sessions(*)
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

    // Fetch user metadata (including coordinates) for each unique author
    const authorIds = [...new Set(courses.map((c) => c.user_id))];
    const authorsWithMetadata = await Promise.all(
      authorIds.map(async (authorId) => {
        const { data: userData, error: userError } =
          await supabaseAdmin.auth.admin.getUserById(authorId);

        if (userError || !userData) {
          return { id: authorId, metadata: null };
        }

        return {
          id: authorId,
          metadata: {
            latitude: userData.user.user_metadata?.latitude || null,
            longitude: userData.user.user_metadata?.longitude || null,
          },
        };
      })
    );

    // Create a map of author metadata
    const authorMetadataMap = new Map(
      authorsWithMetadata.map((author) => [author.id, author.metadata])
    );

    // Format response with author information including coordinates
    const formattedCourses = courses.map((course) => {
      const authorMetadata = authorMetadataMap.get(course.user_id);

      return {
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
        // Author information with coordinates
        author: course.profiles
          ? {
              id: course.profiles.id,
              name: course.profiles.name,
              surname: course.profiles.surname,
              fullName: `${course.profiles.name} ${course.profiles.surname}`,
              email: course.profiles.email,
              userType: course.profiles.user_type,
              latitude: authorMetadata?.latitude || null,
              longitude: authorMetadata?.longitude || null,
            }
          : null,
        sessions: course.course_sessions || [],
      };
    });

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
