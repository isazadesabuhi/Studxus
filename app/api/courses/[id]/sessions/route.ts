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
 * GET /api/courses/[id]/sessions
 * Get all available sessions for a course
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Fetch sessions for the course
    const { data: sessions, error } = await supabaseAdmin
      .from("course_sessions")
      .select("*")
      .eq("course_id", id)
      .gte("session_date", new Date().toISOString().split("T")[0]) // Only future dates
      .order("session_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Error fetching sessions:", error);
      return NextResponse.json(
        { error: "Failed to fetch sessions", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sessions: sessions || [],
    });
  } catch (err: any) {
    console.error("Error in GET /api/courses/[id]/sessions:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses/[id]/sessions
 * Create a new session for a course (only course owner)
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Check if user is the course owner
    const { data: course, error: courseError } = await supabaseAdmin
      .from("courses")
      .select("user_id")
      .eq("id", id)
      .single();

    if (courseError || !course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    if (course.user_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized: Only course owner can create sessions" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { sessionDate, startTime, endTime, maxParticipants, location } = body;

    // Validate required fields
    if (!sessionDate || !startTime || !endTime) {
      return NextResponse.json(
        { error: "sessionDate, startTime, and endTime are required" },
        { status: 400 }
      );
    }

    // Create session
    const { data: session, error: insertError } = await supabaseAdmin
      .from("course_sessions")
      .insert({
        course_id: id,
        session_date: sessionDate,
        start_time: startTime,
        end_time: endTime,
        max_participants: maxParticipants || 5,
        location: location || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating session:", insertError);
      return NextResponse.json(
        { error: "Failed to create session", details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      session,
    });
  } catch (err: any) {
    console.error("Error in POST /api/courses/[id]/sessions:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}

