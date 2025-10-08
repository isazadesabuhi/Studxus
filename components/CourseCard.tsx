"use client";

import Image from "next/image";
import vba from "@/public/vba.jpg";
import { useRouter } from "next/navigation";
export type Course = {
  id: string;
  title: string;
  schedule: string;
  wednesday: string;
  level: string;
  price: string;
  image: string;
};

type Props = {
  course: Course;
  onDetails?: (id: string) => void;
  onEdit?: (id: string) => void;
};

export default function CourseCard({ course, onDetails, onEdit }: Props) {
    const router = useRouter();
  
  return (
    <div className="w-full rounded-3xl border border-slate-200 bg-sky-50/60 p-4 shadow-sm sm:p-5 md:p-6">
      <h2 className="text-xl text-center font-extrabold text-slate-800 sm:text-2xl md:text-3xl">
        {course.title}
      </h2>
      <div className="flex flex-row gap-4 md:flex-row md:items-center">
        {/* Image */}
        <div className="mx-auto">
          <Image
            src={vba}
            alt={course.title}
            width={320}
            height={200}
            className="h-[64px] w-full rounded-2xl object-cover"
            priority
          />
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="mt-2 space-y-1 text-sm text-slate-700 sm:text-base">
            <p>{course.schedule}</p>
            <p>{course.wednesday}</p>
            <p>
              Niveau : <span className="font-medium">{course.level}</span>
            </p>
            <p>
              Prix (à l’heure) :{" "}
              <span className="font-semibold">{course.price}</span>
            </p>
          </div>
        </div>
      </div>
      {/* Actions */}
      <div className="mt-4 flex flex-row gap-3 sm:flex-row">
        <button
          onClick={() => router.push(`/cours/detail/${course.id}`)}
          className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 sm:w-auto"
        >
          Plus de détails
        </button>

        <button
          onClick={() => onEdit?.(course.id)}
          className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-amber-400 hover:bg-slate-800 sm:w-auto"
        >
          Modifier
        </button>
      </div>
    </div>
  );
}
