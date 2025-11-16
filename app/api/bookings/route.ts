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
 * POST /api/bookings
 * Create a new booking
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
      courseId,
      courseSessionId,
      paymentMethod,
      amount,
      messageToInstructor,
      cardLastFour,
      cardBrand,
    } = body;

    // Validate required fields
    if (!courseId || !courseSessionId || !amount) {
      return NextResponse.json(
        { error: "courseId, courseSessionId, and amount are required" },
        { status: 400 }
      );
    }

    // Check if user is trying to book their own course
    const { data: course, error: courseError } = await supabaseAdmin
      .from("courses")
      .select("user_id")
      .eq("id", courseId)
      .single();

    if (courseError || !course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    if (course.user_id === user.id) {
      return NextResponse.json(
        { error: "You cannot book your own course" },
        { status: 400 }
      );
    }

    // Check if session exists and has available spots
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("course_sessions")
      .select("*")
      .eq("id", courseSessionId)
      .eq("course_id", courseId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Session not found or invalid" },
        { status: 404 }
      );
    }

    if (session.current_participants >= session.max_participants) {
      return NextResponse.json(
        { error: "Session is full" },
        { status: 400 }
      );
    }

    // Check if user already has a booking for this session
    const { data: existingBooking } = await supabaseAdmin
      .from("bookings")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_session_id", courseSessionId)
      .in("status", ["pending", "confirmed", "paid"])
      .single();

    if (existingBooking) {
      return NextResponse.json(
        { error: "You already have a booking for this session" },
        { status: 400 }
      );
    }

    // Create booking
    const bookingData: any = {
      user_id: user.id,
      course_id: courseId,
      course_session_id: courseSessionId,
      amount: parseFloat(amount),
      payment_method: paymentMethod || null,
      message_to_instructor: messageToInstructor || null,
      status: paymentMethod ? "pending" : "pending",
      payment_status: paymentMethod ? "processing" : "pending",
    };

    if (cardLastFour) {
      bookingData.card_last_four = cardLastFour;
    }
    if (cardBrand) {
      bookingData.card_brand = cardBrand;
    }

    const { data: booking, error: insertError } = await supabaseAdmin
      .from("bookings")
      .insert(bookingData)
      .select()
      .single();

    if (insertError) {
      console.error("Error creating booking:", insertError);
      return NextResponse.json(
        { error: "Failed to create booking", details: insertError.message },
        { status: 500 }
      );
    }

    // If payment method is provided, we'll process it synchronously
    // In a real application, integrate with Stripe, PayPal, etc.
    // For now, we'll mark it as processing and let the confirm endpoint handle completion

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (err: any) {
    console.error("Error in POST /api/bookings:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bookings
 * Get bookings for the current user
 */
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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // Build query
    let query = supabaseAdmin
      .from("bookings")
      .select(
        `
        *,
        courses:course_id (
          id,
          title,
          description,
          short_description,
          level,
          price_per_hour,
          profiles:user_id (
            id,
            name,
            surname,
            email
          )
        ),
        course_sessions:course_session_id (
          id,
          session_date,
          start_time,
          end_time,
          location
        )
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data: bookings, error } = await query;

    if (error) {
      console.error("Error fetching bookings:", error);
      return NextResponse.json(
        { error: "Failed to fetch bookings", details: error.message },
        { status: 500 }
      );
    }

    console.log("Raw bookings from DB:", bookings);

    // Format response
    const formattedBookings = bookings?.map((booking: any) => {
      console.log("Processing booking:", booking.id, "Course:", booking.courses, "Session:", booking.course_sessions);
      
      return {
        id: booking.id,
        courseId: booking.course_id,
        courseSessionId: booking.course_session_id,
        status: booking.status,
        paymentMethod: booking.payment_method,
        paymentStatus: booking.payment_status,
        amount: parseFloat(booking.amount || 0),
        messageToInstructor: booking.message_to_instructor,
        createdAt: booking.created_at,
        paidAt: booking.paid_at,
        course: booking.courses && typeof booking.courses === 'object' && !Array.isArray(booking.courses)
          ? {
              id: booking.courses.id,
              title: booking.courses.title,
              description: booking.courses.description,
              level: booking.courses.level,
              pricePerHour: parseFloat(booking.courses.price_per_hour || 0),
              author: booking.courses.profiles && typeof booking.courses.profiles === 'object' && !Array.isArray(booking.courses.profiles)
                ? {
                    id: booking.courses.profiles.id,
                    name: booking.courses.profiles.name,
                    surname: booking.courses.profiles.surname,
                    fullName: `${booking.courses.profiles.name || ''} ${booking.courses.profiles.surname || ''}`.trim(),
                    email: booking.courses.profiles.email,
                  }
                : null,
            }
          : null,
        session: booking.course_sessions && typeof booking.course_sessions === 'object' && !Array.isArray(booking.course_sessions)
          ? {
              id: booking.course_sessions.id,
              sessionDate: booking.course_sessions.session_date,
              startTime: booking.course_sessions.start_time,
              endTime: booking.course_sessions.end_time,
              location: booking.course_sessions.location,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      bookings: formattedBookings || [],
    });
  } catch (err: any) {
    console.error("Error in GET /api/bookings:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}

