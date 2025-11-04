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
 * POST /api/bookings/[id]/confirm
 * Confirm a booking payment and update status
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

    // Get booking
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Update booking status
    const { data: updatedBooking, error: updateError } = await supabaseAdmin
      .from("bookings")
      .update({
        status: "paid",
        payment_status: "completed",
        paid_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating booking:", updateError);
      return NextResponse.json(
        { error: "Failed to confirm booking", details: updateError.message },
        { status: 500 }
      );
    }

    // Update session participants count
    const { data: session, error: sessionFetchError } = await supabaseAdmin
      .from("course_sessions")
      .select("current_participants")
      .eq("id", booking.course_session_id)
      .single();

    if (!sessionFetchError && session) {
      const { error: sessionError } = await supabaseAdmin
        .from("course_sessions")
        .update({
          current_participants: (session.current_participants || 0) + 1,
        })
        .eq("id", booking.course_session_id);

      if (sessionError) {
        console.error("Error updating session participants:", sessionError);
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
    });
  } catch (err: any) {
    console.error("Error in POST /api/bookings/[id]/confirm:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}

