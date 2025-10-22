"use client";
import CourseCard, { type Course } from "@/components/CourseCard";
import data from "@/data/courses.json";
import { useState } from "react";

import { useRouter } from "next/navigation";

type TabKey = "sent" | "received";

export default function Page() {
  const courses = data as Course[];
  const router = useRouter();

  const handleDetails = (id: string) => router.push(`/cours/detail/${id}`);
  const handleEdit = (id: string) => console.log("edit:", id);

  const [active, setActive] = useState<TabKey>("received");

  return (
    <main className="relative mx-auto max-w-[450px]">
      {/* 1 column on mobile, 2 on md, 3 on xl */}
     
      <div className="flex w-full justify-start gap-6 border-b border-gray-200 px-3 sm:px-4">
        <button
          onClick={() => setActive("sent")}
          className={`py-3 w-full text-sm font-medium ${active === "sent"
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
            }`}
        >
          Reservés
        </button>
        <button
          onClick={() => setActive("received")}
          className={`py-3 w-full text-sm font-medium ${active === "received"
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
            }`}
        >
          Programmés
        </button>
      </div>


      <div className="grid grid-cols-1 gap-4 ">
        {courses.map((c) => (
          <CourseCard
            key={c.id}
            course={c}
            onDetails={handleDetails}
            onEdit={handleEdit}
          />
        ))}
      </div>


{/* ✅ Bouton flottant avec fond dégradé */}
      <div className="fixed bottom-15 left-0 right-0 mx-auto max-w-[450px]">
        <div className="pointer-events-none absolute inset-0 h-32 bg-gradient-to-t from-white via-white/90 to-transparent"></div>

        <div className="relative z-10 flex justify-center align-middle px-6 pb-4">
          <button
            onClick={() => router.push(`/cours/creer-cours`)}
            className="pointer-events-auto inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-amber-400 hover:bg-slate-800 sm:w-auto"
          >
            Créer un cours
          </button>
        </div>
      </div>

    </main>
  );
}
