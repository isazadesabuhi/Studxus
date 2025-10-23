"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import vba from "@/public/vba.jpg";

type TabKey = "description" | "date" | "similaire";

interface CourseDetail {
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

export default function CourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [active, setActive] = useState<TabKey>("description");
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);

  // Fetch course details and check ownership
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setCurrentUser(user);

        // Fetch course details
        const response = await fetch(`/api/courses/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Cours introuvable");
          }
          throw new Error("Échec du chargement du cours");
        }

        const data = await response.json();
        setCourse(data.course);

        // Check if current user is the course owner
        if (user && data.course.userId === user.id) {
          setIsOwner(true);
        }
      } catch (err: any) {
        console.error("Error fetching course:", err);
        setError(err.message || "Une erreur s'est produite");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourseDetails();
    }
  }, [id]);

  const handleBookCourse = async () => {
    if (!currentUser) {
      alert("Vous devez être connecté pour réserver un cours");
      router.push("/");
      return;
    }

    if (isOwner) {
      alert("Vous ne pouvez pas réserver votre propre cours");
      return;
    }

    // TODO: Implement booking functionality
    alert("Fonctionnalité de réservation à venir !");
  };

  const handleEditCourse = () => {
    router.push(`/cours/modifier/${id}`);
  };

  const handleDeleteCourse = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce cours ?")) {
      return;
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        throw new Error("Session expirée");
      }

      const response = await fetch(`/api/courses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Échec de la suppression");
      }

      alert("Cours supprimé avec succès");
      router.push("/cours");
    } catch (err: any) {
      alert(err.message || "Erreur lors de la suppression");
    }
  };

  const handleContactTeacher = () => {
    if (!currentUser) {
      alert("Vous devez être connecté pour contacter l'enseignant");
      router.push("/");
      return;
    }

    // TODO: Implement messaging functionality
    alert(`Contacter ${course?.author?.fullName} - Fonctionnalité à venir !`);
  };

  if (loading) {
    return (
      <main className="p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-4 text-gray-600">Chargement du cours...</p>
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="p-6 text-center">
        <p className="text-red-600 mb-4">{error || "Cours introuvable"} 😕</p>
        <button
          onClick={() => router.push("/search")}
          className="px-4 py-2 bg-blue-900 text-white rounded-lg"
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
            <p className="text-gray-700 text-sm mt-1">
              {course.shortDescription || course.description}
            </p>
          </div>
        </div>

        {/* --- Course Info Cards --- */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600">Prix</p>
            <p className="text-lg font-bold text-blue-900">
              {course.pricePerHour}€/h
            </p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600">Niveau</p>
            <p className="text-lg font-bold text-blue-900">{course.level}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600">Catégorie</p>
            <p className="text-lg font-bold text-blue-900">{course.category}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600">Places</p>
            <p className="text-lg font-bold text-blue-900">
              Max {course.maxParticipants}
            </p>
          </div>
        </div>

        {/* --- Enseignant --- */}
        <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg mb-6">
          <div>
            <p className="font-semibold text-blue-900">
              {course.author?.fullName || "Anonyme"}
            </p>
            <p className="text-sm text-gray-600">
              {course.author?.userType || "Enseignant"}
            </p>
          </div>
          {!isOwner && (
            <button
              onClick={handleContactTeacher}
              className="text-blue-900 border border-blue-900 rounded-full px-3 py-1 text-sm hover:bg-blue-100"
            >
              Contacter
            </button>
          )}
        </div>

        {/* --- Owner Actions --- */}
        {isOwner && (
          <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 mb-2">
              ✏️ Vous êtes le propriétaire de ce cours
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleEditCourse}
                className="flex-1 text-blue-900 border border-blue-900 rounded-full px-4 py-2 text-sm font-medium hover:bg-blue-50"
              >
                Modifier
              </button>
              <button
                onClick={handleDeleteCourse}
                className="flex-1 text-red-600 border border-red-600 rounded-full px-4 py-2 text-sm font-medium hover:bg-red-50"
              >
                Supprimer
              </button>
            </div>
          </div>
        )}

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
          {active === "description" ? (
            <div className="text-gray-700 leading-relaxed px-2">
              <p className="mb-4 whitespace-pre-line">{course.description}</p>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Informations complémentaires
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Créé le:</span>{" "}
                    {new Date(course.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                  <p>
                    <span className="font-medium">Dernière mise à jour:</span>{" "}
                    {new Date(course.updatedAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
            </div>
          ) : active === "date" ? (
            <div className="text-center text-gray-600 py-10">
              📅 Calendrier des dates disponibles - Fonctionnalité à venir
            </div>
          ) : (
            <div className="text-center text-gray-600 py-10">
              🧩 Cours similaires - Fonctionnalité à venir
            </div>
          )}
        </div>

        {/* --- Action Button (Book or Edit) --- */}
        {!isOwner && (
          <div className="mt-6">
            <button
              onClick={handleBookCourse}
              className="w-full bg-blue-900 text-white py-3 rounded-full font-semibold hover:bg-blue-800"
            >
              Réserver ce cours
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
