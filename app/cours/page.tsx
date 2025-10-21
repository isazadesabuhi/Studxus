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
    <main className="mx-auto max-w-[450px]">
      {/* 1 column on mobile, 2 on md, 3 on xl */}
      <div className="flex justify-start gap-6 border-b border-gray-200 px-3 sm:px-4">
        <button
          onClick={() => setActive("sent")}
          className={`py-3 text-sm font-medium ${
            active === "sent"
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
          }`}
        >
          Mes prochains cours
        </button>
        <button
          onClick={() => setActive("received")}
          className={`py-3 text-sm font-medium ${
            active === "received"
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
          }`}
        >
          Mes cours passés
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
    </main>
  );
}
