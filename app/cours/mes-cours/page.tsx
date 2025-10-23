"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import CourseCard, { type Course } from "@/components/CourseCard";

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

export default function MyCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<APICourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch user's courses on component mount
  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.push("/"); // Redirect to login if not authenticated
          return;
        }

        setUserId(user.id);

        // Fetch courses filtered by current user's ID
        const response = await fetch(`/api/courses?userId=${user.id}`, {
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

    fetchMyCourses();
  }, [router]);

  const handleDetails = (id: string) => {
    router.push(`/cours/detail/${id}`);
  };

  const handleEdit = (id: string) => {
    console.log("Edit course:", id);
    // TODO: Implement edit functionality
    // router.push(`/cours/modifier/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce cours ?")) {
      return;
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        throw new Error("Session expirée");
      }

      // TODO: Implement DELETE endpoint
      const response = await fetch(`/api/courses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Échec de la suppression");
      }

      // Remove from state
      setCourses(courses.filter((c) => c.id !== id));
      alert("Cours supprimé avec succès");
    } catch (err: any) {
      alert(err.message || "Erreur lors de la suppression");
    }
  };

  // Transform API data to CourseCard format
  const transformToCourseCard = (apiCourse: APICourse): Course => {
    return {
      id: apiCourse.id,
      title: apiCourse.title,
      schedule: `Prix: ${apiCourse.pricePerHour}€/h`,
      wednesday: `Max participants: ${apiCourse.maxParticipants}`,
      level: apiCourse.level,
      price: `${apiCourse.pricePerHour}€/h`,
      image: "/vba.jpg", // Default image
    };
  };

  if (loading) {
    return (
      <main className="relative mx-auto max-w-[450px] p-4">
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Chargement de vos cours...</p>
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
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-blue-900">Mes cours créés</h1>
        <p className="text-sm text-gray-600 mt-1">
          {courses.length} cours créé{courses.length > 1 ? "s" : ""}
        </p>
      </div>

      {/* Courses List */}
      <div className="p-4">
        {courses.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600 mb-4">
              Vous n'avez pas encore créé de cours
            </p>
            <button
              onClick={() => router.push("/cours/creer-cours")}
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-amber-400 hover:bg-slate-800"
            >
              Créer mon premier cours
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {courses.map((course) => (
              <div key={course.id} className="relative">
                <CourseCard
                  course={transformToCourseCard(course)}
                  onDetails={handleDetails}
                  onEdit={handleEdit}
                />

                {/* Additional course info */}
                <div className="mt-2 px-4 py-2 bg-gray-50 rounded-lg text-sm">
                  <p className="text-gray-700">
                    <span className="font-semibold">Catégorie:</span>{" "}
                    {course.category}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Créé le:</span>{" "}
                    {new Date(course.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleDelete(course.id)}
                  className="mt-2 w-full text-red-600 text-sm py-2 border border-red-600 rounded-full hover:bg-red-50"
                >
                  Supprimer ce cours
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Create Button */}
      {courses.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 mx-auto max-w-[450px]">
          <div className="pointer-events-none absolute inset-0 h-32 bg-gradient-to-t from-white via-white/90 to-transparent"></div>

          <div className="relative z-10 flex justify-center align-middle px-6 pb-4">
            <button
              onClick={() => router.push("/cours/creer-cours")}
              className="pointer-events-auto inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-amber-400 hover:bg-slate-800 sm:w-auto"
            >
              Créer un nouveau cours
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
