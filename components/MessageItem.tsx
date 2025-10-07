"use client";

import Image from "next/image";

export type Conversation = {
  id: string;
  type: "sent" | "received";
  name: string;
  avatar?: string;
  snippet: string;
  time: string;
  unread?: boolean;
};

export default function MessageItem({
  name,
  avatar,
  snippet,
  time,
  unread,
}: Conversation) {
  return (
    <div
      className={`flex items-center justify-between px-3 sm:px-4 py-3 sm:py-3.5 border-b border-gray-200 ${
        unread ? "bg-blue-50" : "bg-white"
      }`}
      role="button"
      aria-label={`Conversation avec ${name}`}
    >
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-indigo-900/90 text-white flex items-center justify-center">
          {avatar ? (
            <Image
              src={avatar}
              alt={name}
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            // simple placeholder “badge” icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-5 w-5 opacity-90"
              fill="currentColor"
            >
              <path d="M12 2a7 7 0 0 0-4.95 11.95l-1.4 3.72a1 1 0 0 0 1.28 1.28l3.72-1.4A7 7 0 1 0 12 2zm-5 7a5 5 0 1 1 10 0 5 5 0 0 1-10 0z" />
            </svg>
          )}
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900 leading-tight">
            {name}
          </span>
          <span className="text-sm text-gray-600 leading-tight truncate max-w-[200px] sm:max-w-[360px]">
            {snippet}
          </span>
        </div>
      </div>

      <span className="text-xs text-gray-500">{time}</span>
    </div>
  );
}
