"use client";

import { useMemo, useState } from "react";
import MessageItem, { Conversation } from "@/components/MessageItem";
import data from "@/data/conversations.json";

type TabKey = "sent" | "received";

export default function ConversationsPage() {
  const [active, setActive] = useState<TabKey>("received");

  const conversations = data.conversations as Conversation[];

  const filtered = useMemo(
    () => conversations.filter((c) => c.type === active),
    [conversations, active]
  );

  return (
    <main className="mx-auto max-w-screen-sm">
      {/* Top Tabs */}
      <div className="flex justify-start gap-6 border-b border-gray-200 px-3 sm:px-4">
        <button
          onClick={() => setActive("sent")}
          className={`py-3 text-sm font-medium ${
            active === "sent"
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
          }`}
        >
          Demandes envoyées
        </button>
        <button
          onClick={() => setActive("received")}
          className={`py-3 text-sm font-medium ${
            active === "received"
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
          }`}
        >
          Demandes reçues
        </button>
      </div>

      {/* Section title */}
      <div className="px-3 sm:px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-700">Conversations</h2>
      </div>

      {/* List */}
      <section className="rounded-md overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-gray-500">
            Aucune conversation.
          </div>
        ) : (
          filtered.map((c) => <MessageItem key={c.id} {...c} />)
        )}
      </section>
    </main>
  );
}
