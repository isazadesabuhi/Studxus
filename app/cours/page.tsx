"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import CourseCard, { type Course } from "@/components/CourseCard";

type TabKey = "sent" | "received";

interface APICourse {
  id: string;
  userId: string;
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  level: string;
  pricePerHour: number;
  maxParticipants: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    surname: string;
    fullName: string;
    email: string;
    userType: string;
  } | null;
}

export default function Page() {
  const router = useRouter();
  const [courses, setCourses] = useState<APICourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<TabKey>("received");

  // Fetch all courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all courses from API
        const response = await fetch("/api/courses", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Échec du chargement des cours");
        }

        const data = await response.json();
        setCourses(data.courses || []);
      } catch (err: any) {
        console.error("Error fetching courses:", err);
        setError(err.message || "Une erreur s'est produite");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleDetails = (id: string) => router.push(`/cours/detail/${id}`);
  const handleEdit = (id: string) => console.log("edit:", id);

  // Transform API data to CourseCard format
  const transformToCourseCard = (apiCourse: APICourse): Course => {
    return {
      id: apiCourse.id,
      title: apiCourse.title,
      schedule: apiCourse.shortDescription || apiCourse.description,
      wednesday: `Par ${apiCourse.author?.fullName || "Anonyme"}`,
      level: apiCourse.level,
      price: `${apiCourse.pricePerHour}€/h`,
      image: "/vba.jpg", // Default image
      category: apiCourse.category,
      teacherName: apiCourse.author?.fullName || "Anonyme",
      rating: 4.5, // Default rating (could be added to API later)
      distance: 2.5, // Default distance (could be calculated based on user location)
      days: [], // Could be added based on course schedule
      timeSlot: "À définir", // Could be added based on course schedule
    };
  };

  if (loading) {
    return (
      <main className="relative mx-auto max-w-[450px] p-4">
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Chargement des cours...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="relative mx-auto max-w-[450px] p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-red-700 underline"
          >
            Réessayer
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative mx-auto max-w-[450px]">
      {/* Tabs */}
      <div className="flex w-full justify-start gap-6 border-b border-gray-200 px-3 sm:px-4">
        <button
          onClick={() => setActive("sent")}
          className={`py-3 w-full text-sm font-medium ${
            active === "sent"
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
          }`}
        >
          Réservés
        </button>
        <button
          onClick={() => setActive("received")}
          className={`py-3 w-full text-sm font-medium ${
            active === "received"
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
          }`}
        >
          Programmés
        </button>
      </div>

      {/* Course Cards */}
      <div className="grid grid-cols-1 gap-4 p-4">
        {courses.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600 mb-4">Aucun cours disponible</p>
          </div>
        ) : (
          courses.map((course) => (
            <CourseCard
              key={course.id}
              course={transformToCourseCard(course)}
              onDetails={handleDetails}
              onEdit={handleEdit}
            />
          ))
        )}
      </div>

      {/* Floating Create Button */}
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
