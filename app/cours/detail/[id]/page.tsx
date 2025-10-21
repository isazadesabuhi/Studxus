"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import data from "@/data/courses.json";
import CourseCalendar from "@/components/CourseCalendar";
import vba from "@/public/vba.jpg";
import Image from "next/image";

type TabKey = "description" | "date" | "similaire";

export default function CourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [active, setActive] = useState<TabKey>("date");

  // 🔍 Trouver le cours correspondant à l'id depuis le JSON
  const course = data.find((course) => course.id === id);

  if (!course) {
    return (
      <main className="p-6 text-center">
        <p className="text-gray-600">Cours introuvable 😕</p>
        <button
          onClick={() => router.push("/recherche")}
          className="mt-4 px-4 py-2 bg-blue-900 text-white rounded-lg"
        >
          Retour à la recherche
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-screen-sm bg-white rounded-lg shadow-sm">
      {/* --- En-tête --- */}
      <div className="p-4">
        <button
          onClick={() => router.back()}
          className="text-blue-900 font-semibold mb-3"
        >
          ← Retour
        </button>

        <div className="flex items-center gap-4 mb-4">
          <Image
            src={vba}
            alt={course.title}
            className="w-20 h-20 rounded-lg object-cover"
          />
          <div>
            <h1 className="text-2xl font-bold text-blue-900">{course.title}</h1>
            <p className="text-gray-700 text-sm mt-1">{course.description}</p>
          </div>
        </div>

        {/* --- Enseignant --- */}
        <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg mb-6">
          <div>
            <p className="font-semibold text-blue-900">{course.enseignant}</p>
            <p className="text-sm text-gray-600">
              {course.note}⭐ — {course.avis} avis
            </p>
          </div>
          <button className="text-blue-900 border border-blue-900 rounded-full px-3 py-1 text-sm">
            Voir les avis
          </button>
        </div>

        {/* --- Onglets --- */}
        <div className="flex justify-between w-full mx-auto gap-6 border-b border-gray-200 px-3 sm:px-4">
          <button
            onClick={() => setActive("description")}
            className={`py-3 text-sm font-medium ${
              active === "description"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActive("date")}
            className={`py-3 text-sm font-medium ${
              active === "date"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
            }`}
          >
            Dates
          </button>
          <button
            onClick={() => setActive("similaire")}
            className={`py-3 text-sm font-medium ${
              active === "similaire"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
            }`}
          >
            Similaires
          </button>
        </div>

        {/* --- Contenu Onglets --- */}
        <div className="mt-4">
          {active === "similaire" ? (
            <div className="text-center text-gray-600 py-10">
              🧩 Bientôt disponible : suggestions de cours similaires
            </div>
          ) : active === "description" ? (
            <div className="text-gray-700 leading-relaxed px-2">
              <p className="mb-4">{course.description}</p>
              <p>
                <strong>Niveau :</strong> {course.level}
              </p>
              <p>
                <strong>Prix :</strong> {course.price}
              </p>
              <p>
                <strong>Horaires :</strong> {course.schedule}
              </p>
              {course.wednesday && (
                <p>
                  <strong>Autre créneau :</strong> {course.wednesday}
                </p>
              )}
            </div>
          ) : (
            <CourseCalendar courseId={course.id} />
          )}
        </div>
      </div>
    </main>
  );
}
