"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import MessageItem from "@/components/MessageItem";

interface ApiConversation {
  id: string;
  otherUser: {
    id: string;
    email: string;
    name: string;
    surname: string;
    fullName: string;
  };
  lastMessage: {
    id: string;
    message: string;
    subject: string | null;
    createdAt: string;
    senderId: string;
    isRead: boolean;
  } | null;
  unreadCount: number;
  createdAt: string;
  lastMessageAt: string;
}

type TabKey = "all" | "unread";

export default function ConversationsPage() {
  const router = useRouter();
  const [active, setActive] = useState<TabKey>("all");
  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch conversations from API
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user session
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/");
          return;
        }

        // Get user's token
        const { data: sessionData } = await supabase.auth.getSession();

        if (!sessionData.session) {
          throw new Error("Session expirée");
        }

        // Fetch conversations
        const response = await fetch("/api/messages", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sessionData.session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Échec du chargement des conversations");
        }

        const data = await response.json();
        setConversations(data.conversations || []);
      } catch (err: any) {
        console.error("Error fetching conversations:", err);
        setError(err.message || "Une erreur s'est produite");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [router]);

  // Filter conversations based on active tab
  const filteredConversations =
    active === "unread"
      ? conversations.filter((c) => c.unreadCount > 0)
      : conversations;

  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `${diffInMinutes} min`;
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInDays === 1) return "Hier";
    if (diffInDays < 7) return `${diffInDays} j`;

    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  // Navigate to conversation detail
  const handleConversationClick = (conversationId: string) => {
    router.push(`/message/${conversationId}`);
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-screen-sm">
        <div className="flex justify-center items-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="ml-3 text-gray-600">Chargement des conversations...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-screen-sm">
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-red-700 underline"
            >
              Réessayer
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-screen-sm">
      {/* Top Tabs */}
      <div className="flex justify-start gap-6 border-b border-gray-200 px-3 sm:px-4">
        <button
          onClick={() => setActive("all")}
          className={`py-3 text-sm font-medium ${
            active === "all"
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
          }`}
        >
          Toutes
          {conversations.length > 0 && (
            <span className="ml-1 text-xs">({conversations.length})</span>
          )}
        </button>
        <button
          onClick={() => setActive("unread")}
          className={`py-3 text-sm font-medium ${
            active === "unread"
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
          }`}
        >
          Non lues
          {conversations.filter((c) => c.unreadCount > 0).length > 0 && (
            <span className="ml-1 px-1.5 text-xs bg-primary text-white rounded-full">
              {conversations.filter((c) => c.unreadCount > 0).length}
            </span>
          )}
        </button>
      </div>

      {/* Section title */}
      <div className="px-3 sm:px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-700">Messages</h2>
      </div>

      {/* List */}
      <section className="rounded-md overflow-hidden">
        {filteredConversations.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-sm text-gray-500">
              {active === "unread"
                ? "Aucun message non lu"
                : "Aucune conversation"}
            </p>
            {active === "all" && (
              <p className="text-xs text-gray-400 mt-2">
                Vos conversations apparaîtront ici
              </p>
            )}
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => handleConversationClick(conversation.id)}
              className="cursor-pointer"
            >
              <MessageItem
                id={conversation.id}
                type="received" // This is now just for compatibility
                name={
                  conversation.otherUser.fullName ||
                  conversation.otherUser.email
                }
                avatar=""
                snippet={conversation.lastMessage?.message || "Aucun message"}
                time={formatTime(
                  conversation.lastMessage?.createdAt || conversation.createdAt
                )}
                unread={conversation.unreadCount > 0}
              />
            </div>
          ))
        )}
      </section>

      {/* Empty state for all conversations */}
      {conversations.length === 0 && !loading && (
        <div className="px-4 py-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-800 mb-2">
              💡 Vous n'avez pas encore de conversations
            </p>
            <p className="text-xs text-blue-600">
              Contactez un enseignant depuis la page d'un cours pour commencer à
              discuter !
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
