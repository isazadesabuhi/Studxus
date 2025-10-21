"use client";
import Image from "next/image";
import map from "@/public/map.jpg";
import CourseCard, { type Course } from "@/components/CourseCard";
import data from "@/data/courses.json";

export default function Message() {
  const courses = data as Course[];
  const handleDetails = (id: string) => console.log("details:", id);
  const handleEdit = (id: string) => console.log("edit:", id);
  return (
    <div className="flex flex-col justify-center">
      <input
        id="name"
        name="name"
        type="text"
        autoComplete="given-name"
        required
        className="w-full mt-2 block rounded-[100px] border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        placeholder="Jardinage"
      />
      <Image src={map} width={400} height={300} className="pt-4" alt="Map" />
      <div className="grid grid-cols-1 px-2">
        {courses.slice(0, 1).map((c) => (
          <CourseCard
            key={c.id}
            course={c}
            onDetails={handleDetails}
            onEdit={handleEdit}
          />
        ))}
      </div>
      <button className="mt-2 block rounded-[100px] border border-gray-300 px-8 py-3 text-[#D4EEFF] placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-[#1A3A60]">
        Voir la liste
      </button>
    </div>
  );
}
