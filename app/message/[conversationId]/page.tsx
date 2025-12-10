"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Send } from "lucide-react";

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  message: string;
  subject: string | null;
  isRead: boolean;
  createdAt: string;
  isSentByMe: boolean;
}

interface OtherUser {
  id: string;
  email: string;
  name: string;
  surname: string;
  fullName: string;
}

export default function ConversationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  // const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversation messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/");
          return;
        }

        // setCurrentUserId(user.id);

        // Get user's token
        const { data: sessionData } = await supabase.auth.getSession();

        if (!sessionData.session) {
          throw new Error("Session expirée");
        }

        // Fetch messages in conversation
        const response = await fetch(`/api/messages/${conversationId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sessionData.session.access_token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Conversation introuvable");
          }
          if (response.status === 403) {
            throw new Error("Accès non autorisé à cette conversation");
          }
          throw new Error("Échec du chargement des messages");
        }

        const data = await response.json();
        setMessages(data.messages || []);
        setOtherUser(data.conversation.otherUser);
      } catch (err: any) {
        console.error("Error fetching messages:", err);
        setError(err.message || "Une erreur s'est produite");
      } finally {
        setLoading(false);
      }
    };

    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId, router]);

  // Send new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !otherUser) return;

    try {
      setSending(true);

      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        throw new Error("Session expirée");
      }

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({
          recipientId: otherUser.id,
          message: newMessage.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Échec de l'envoi du message");
      }

      const data = await response.json();

      // Add new message to the list
      const newMsg: Message = {
        id: data.message.id,
        conversationId: data.message.conversation_id,
        senderId: data.message.sender_id,
        recipientId: data.message.recipient_id,
        message: data.message.message,
        subject: data.message.subject,
        isRead: false,
        createdAt: data.message.created_at,
        isSentByMe: true,
      };

      setMessages([...messages, newMsg]);
      setNewMessage("");
    } catch (err: any) {
      console.error("Error sending message:", err);
      alert(err.message || "Erreur lors de l'envoi du message");
    } finally {
      setSending(false);
    }
  };

  // Format timestamp
  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInHours < 24) {
      return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-screen-sm bg-white min-h-screen">
        <div className="flex justify-center items-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="ml-3 text-gray-600">Chargement...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-screen-sm bg-white min-h-screen">
        <div className="p-6">
          <button
            onClick={() => router.back()}
            className="text-blue-900 font-semibold mb-4"
          >
            ← Retour
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => router.push("/message")}
              className="mt-2 text-sm text-red-700 underline"
            >
              Retour aux messages
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-screen-sm bg-white min-h-screen flex flex-col pb-5">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold text-gray-900">
              {otherUser?.fullName || otherUser?.email || "Utilisateur"}
            </h1>
            {otherUser?.email && (
              <p className="text-xs text-gray-500">{otherUser.email}</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-sm text-gray-500">
              Aucun message dans cette conversation
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Envoyez un message pour commencer !
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.isSentByMe ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  message.isSentByMe
                    ? "bg-blue-900 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                {message.subject && (
                  <p
                    className={`text-xs font-semibold mb-1 ${
                      message.isSentByMe ? "text-yellow-200" : "text-gray-600"
                    }`}
                  >
                    {message.subject}
                  </p>
                )}
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.message}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    message.isSentByMe ? "text-blue-200" : "text-gray-500"
                  }`}
                >
                  {formatTimestamp(message.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4 bg-white sticky bottom-0">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            disabled={sending}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="px-4 py-3 bg-blue-900 text-white rounded-full hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
