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
 * POST /api/messages
 * Send a new message to another user
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
    const { recipientId, message, subject } = body;

    // Validate required fields
    if (!recipientId || !message) {
      return NextResponse.json(
        { error: "recipientId and message are required" },
        { status: 400 }
      );
    }

    // Check if recipient exists
    const { data: recipientUser, error: recipientError } =
      await supabaseAdmin.auth.admin.getUserById(recipientId);

    if (recipientError || !recipientUser) {
      return NextResponse.json(
        { error: "Recipient user not found" },
        { status: 404 }
      );
    }

    // Check if user is trying to message themselves
    if (user.id === recipientId) {
      return NextResponse.json(
        { error: "Cannot send message to yourself" },
        { status: 400 }
      );
    }

    // Get or create conversation between users
    let conversationId: string;

    // Check if conversation exists (either direction)
    const { data: existingConversations } = await supabaseAdmin
      .from("conversations")
      .select("id")
      .or(
        `and(user1_id.eq.${user.id},user2_id.eq.${recipientId}),and(user1_id.eq.${recipientId},user2_id.eq.${user.id})`
      )
      .single();

    if (existingConversations) {
      conversationId = existingConversations.id;
    } else {
      // Create new conversation
      const { data: newConversation, error: createConvError } =
        await supabaseAdmin
          .from("conversations")
          .insert({
            user1_id: user.id,
            user2_id: recipientId,
          })
          .select()
          .single();

      if (createConvError) {
        console.error("Error creating conversation:", createConvError);
        return NextResponse.json(
          {
            error: "Failed to create conversation",
            details: createConvError.message,
          },
          { status: 500 }
        );
      }

      conversationId = newConversation.id;
    }

    // Create the message
    const { data: newMessage, error: messageError } = await supabaseAdmin
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        recipient_id: recipientId,
        message: message,
        subject: subject || null,
      })
      .select()
      .single();

    if (messageError) {
      console.error("Error creating message:", messageError);
      return NextResponse.json(
        { error: "Failed to send message", details: messageError.message },
        { status: 500 }
      );
    }

    // Update conversation's last_message_at
    await supabaseAdmin
      .from("conversations")
      .update({
        last_message_at: new Date().toISOString(),
      })
      .eq("id", conversationId);

    return NextResponse.json(
      {
        success: true,
        message: {
          ...newMessage,
          sender: {
            id: user.id,
            email: user.email,
          },
          recipient: {
            id: recipientId,
            email: recipientUser.user.email,
          },
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Error in POST /api/messages:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/messages
 * Get all conversations for the current user
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

    // Get all conversations where user is either user1 or user2
    const { data: conversations, error: convError } = await supabaseAdmin
      .from("conversations")
      .select(
        `
        id,
        user1_id,
        user2_id,
        created_at,
        last_message_at
      `
      )
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order("last_message_at", { ascending: false });

    if (convError) {
      console.error("Error fetching conversations:", convError);
      return NextResponse.json(
        {
          error: "Failed to fetch conversations",
          details: convError.message,
        },
        { status: 500 }
      );
    }

    // For each conversation, get the other user's details and last message
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId =
          conv.user1_id === user.id ? conv.user2_id : conv.user1_id;

        // Get other user details
        const { data: otherUser } = await supabaseAdmin.auth.admin.getUserById(
          otherUserId
        );

        // Get last message in conversation
        const { data: lastMessage } = await supabaseAdmin
          .from("messages")
          .select("*")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        // Get unread count for current user
        const { count: unreadCount } = await supabaseAdmin
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .eq("recipient_id", user.id)
          .eq("is_read", false);

        return {
          id: conv.id,
          otherUser: otherUser?.user
            ? {
                id: otherUser.user.id,
                email: otherUser.user.email,
                name: otherUser.user.user_metadata?.name,
                surname: otherUser.user.user_metadata?.surname,
                fullName: `${otherUser.user.user_metadata?.name || ""} ${
                  otherUser.user.user_metadata?.surname || ""
                }`.trim(),
              }
            : null,
          lastMessage: lastMessage
            ? {
                id: lastMessage.id,
                message: lastMessage.message,
                subject: lastMessage.subject,
                createdAt: lastMessage.created_at,
                senderId: lastMessage.sender_id,
                isRead: lastMessage.is_read,
              }
            : null,
          unreadCount: unreadCount || 0,
          createdAt: conv.created_at,
          lastMessageAt: conv.last_message_at,
        };
      })
    );

    return NextResponse.json({
      success: true,
      conversations: conversationsWithDetails,
    });
  } catch (err: any) {
    console.error("Error in GET /api/messages:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
