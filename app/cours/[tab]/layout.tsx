"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";

export default function CoursLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isReserves = pathname?.startsWith("/cours/reserves");
  const isEnseignes = pathname?.startsWith("/cours/enseignes");

  return (
    <main className="relative mx-auto max-w-[450px]">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-blue-900">Mes Cours</h1>
      </div>

      {/* Persistent buttons */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => router.push("/cours/reserves")}
          className={`flex-1 py-3 text-sm font-medium ${
            isReserves
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
          }`}
        >
          Réservés
        </button>
        <button
          onClick={() => router.push("/cours/enseignes")}
          className={`flex-1 py-3 text-sm font-medium ${
            isEnseignes
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
          }`}
        >
          Enseignés
        </button>
      </div>

      {/* Dynamic content */}
      {children}
    </main>
  );
}
