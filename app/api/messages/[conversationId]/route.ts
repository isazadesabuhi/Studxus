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
 * GET /api/messages/[conversationId]
 * Get all messages in a specific conversation
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
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

    const { conversationId } = await params;

    // Check if user is part of this conversation
    const { data: conversation, error: convError } = await supabaseAdmin
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    if (
      conversation.user1_id !== user.id &&
      conversation.user2_id !== user.id
    ) {
      return NextResponse.json(
        { error: "Unauthorized: You are not part of this conversation" },
        { status: 403 }
      );
    }

    // Get all messages in the conversation
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
      return NextResponse.json(
        { error: "Failed to fetch messages", details: messagesError.message },
        { status: 500 }
      );
    }

    // Mark messages as read if they are for the current user
    await supabaseAdmin
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .eq("recipient_id", user.id)
      .eq("is_read", false);

    // Get other user details
    const otherUserId =
      conversation.user1_id === user.id
        ? conversation.user2_id
        : conversation.user1_id;
    const { data: otherUser } = await supabaseAdmin.auth.admin.getUserById(
      otherUserId
    );

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation.id,
        otherUser: {
          id: otherUser?.user.id,
          email: otherUser?.user.email,
          name: otherUser?.user.user_metadata?.name,
          surname: otherUser?.user.user_metadata?.surname,
          fullName: `${otherUser?.user.user_metadata?.name || ""} ${
            otherUser?.user.user_metadata?.surname || ""
          }`.trim(),
        },
      },
      messages: messages.map((msg) => ({
        id: msg.id,
        conversationId: msg.conversation_id,
        senderId: msg.sender_id,
        recipientId: msg.recipient_id,
        message: msg.message,
        subject: msg.subject,
        isRead: msg.is_read,
        createdAt: msg.created_at,
        isSentByMe: msg.sender_id === user.id,
      })),
    });
  } catch (err: any) {
    console.error("Error in GET /api/messages/[conversationId]:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/messages/[conversationId]
 * Mark all messages in a conversation as read
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
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

    const { conversationId } = await params;

    // Check if user is part of this conversation
    const { data: conversation, error: convError } = await supabaseAdmin
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    if (
      conversation.user1_id !== user.id &&
      conversation.user2_id !== user.id
    ) {
      return NextResponse.json(
        { error: "Unauthorized: You are not part of this conversation" },
        { status: 403 }
      );
    }

    // Mark all messages for current user as read
    const { error: updateError } = await supabaseAdmin
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .eq("recipient_id", user.id)
      .eq("is_read", false);

    if (updateError) {
      console.error("Error marking messages as read:", updateError);
      return NextResponse.json(
        {
          error: "Failed to mark messages as read",
          details: updateError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (err: any) {
    console.error("Error in PATCH /api/messages/[conversationId]:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
