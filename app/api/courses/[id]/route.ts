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
 * GET /api/courses/[id]
 * Get a single course by ID with author information
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

    // Fetch course with author information using JOIN
    const { data: course, error } = await supabaseAdmin
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
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching course:", error);

      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Course not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: "Failed to fetch course" },
        { status: 500 }
      );
    }

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Format response with author information
    const formattedCourse = {
      id: course.id,
      userId: course.user_id,
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      pricePerHour: course.price_per_hour,
      maxParticipants: course.max_participants,
      createdAt: course.created_at,
      updatedAt: course.updated_at,
      sessions: Array.isArray(course.course_sessions)
        ? course.course_sessions.map((session: any) => ({
            id: session.id,
            sessionDate: session.session_date,
            startTime: session.start_time,
            endTime: session.end_time,
            maxParticipants: session.max_participants,
            currentParticipants: session.current_participants,
            location: session.location,
            createdAt: session.created_at,
            updatedAt: session.updated_at,
          }))
        : [],
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
    };

    return NextResponse.json({
      success: true,
      course: formattedCourse,
    });
  } catch (error) {
    console.error("Unexpected error fetching course:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/courses/[id]
 * Update a course (only by owner)
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Check if course exists and belongs to user
    const { data: existingCourse, error: fetchError } = await supabaseAdmin
      .from("courses")
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchError || !existingCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (existingCourse.user_id !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to update this course" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await req.json();
    const {
      title,
      description,
      category,
      level,
      pricePerHour,
      maxParticipants,
    } = body;

    // Prepare update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (level !== undefined) updateData.level = level;
    if (pricePerHour !== undefined)
      updateData.price_per_hour = Number(pricePerHour);
    if (maxParticipants !== undefined)
      updateData.max_participants = Number(maxParticipants);

    // Update the course
    const { data: updatedCourse, error: updateError } = await supabaseAdmin
      .from("courses")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating course:", updateError);
      return NextResponse.json(
        { error: "Failed to update course" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Course updated successfully",
      course: {
        id: updatedCourse.id,
        userId: updatedCourse.user_id,
        title: updatedCourse.title,
        description: updatedCourse.description,
        category: updatedCourse.category,
        level: updatedCourse.level,
        pricePerHour: updatedCourse.price_per_hour,
        maxParticipants: updatedCourse.max_participants,
        updatedAt: updatedCourse.updated_at,
      },
    });
  } catch (error) {
    console.error("Unexpected error updating course:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/courses/[id]
 * Delete a course (only by owner)
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Check if course exists and belongs to user
    const { data: existingCourse, error: fetchError } = await supabaseAdmin
      .from("courses")
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchError || !existingCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (existingCourse.user_id !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to delete this course" },
        { status: 403 }
      );
    }

    // Delete the course
    const { error: deleteError } = await supabaseAdmin
      .from("courses")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting course:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete course" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Unexpected error deleting course:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
