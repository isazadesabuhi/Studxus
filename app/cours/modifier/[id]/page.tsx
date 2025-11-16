"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const levelOptions = ["Débutant", "Intermédiaire", "Avancé"];

interface CourseFormData {
  title: string;
  description: string;
  category: string;
  level: string;
  pricePerHour: number;
  maxParticipants: number;
}

export default function EditCoursePage() {
  const params = useParams();
  const id = (params?.id as string) || "";
  const router = useRouter();

  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    category: "",
    level: "Débutant",
    pricePerHour: 10,
    maxParticipants: 5,
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await fetch("/api/users/interests", {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error("Impossible de récupérer les catégories");
        }

        const data = await response.json();
        const availableCategories: string[] = data?.available_interests || [];
        setCategories(availableCategories);
      } catch (err: any) {
        console.error("Error fetching categories:", err);
        setError(err.message || "Erreur lors du chargement des catégories");
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch course and check ownership
  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError || !sessionData.session) {
          throw new Error("Vous devez être connecté pour modifier un cours");
        }

        const currentUserId = sessionData.session.user.id;

        const response = await fetch(`/api/courses/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Cours introuvable");
          }
          throw new Error("Échec du chargement du cours");
        }

        const data = await response.json();
        const course = data.course;

        if (!course || course.userId !== currentUserId) {
          setIsAuthorized(false);
          throw new Error("Vous n'avez pas la permission de modifier ce cours");
        }

        setIsAuthorized(true);
        setFormData({
          title: course.title || "",
          description: course.description || "",
          category: course.category || "",
          level: course.level || "Débutant",
          pricePerHour: Number(course.pricePerHour) || 0,
          maxParticipants: Number(course.maxParticipants) || 1,
        });
      } catch (err: any) {
        console.error("Error fetching course for edit:", err);
        setError(err.message || "Une erreur s'est produite");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  // Ensure course category appears in the dropdown
  useEffect(() => {
    if (
      formData.category &&
      categories.length > 0 &&
      !categories.includes(formData.category)
    ) {
      setCategories((prev) => [...prev, formData.category]);
    }
  }, [formData.category, categories]);

  const handleInputChange = (
    field: keyof CourseFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) return;
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        throw new Error("Votre session a expiré. Veuillez vous reconnecter.");
      }

      const response = await fetch(`/api/courses/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          level: formData.level,
          pricePerHour: Number(formData.pricePerHour),
          maxParticipants: Number(formData.maxParticipants),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Échec de la mise à jour du cours");
      }

      setSuccessMessage("Cours mis à jour avec succès !");
      router.push(`/cours/detail/${id}`);
    } catch (err: any) {
      console.error("Error updating course:", err);
      setError(err.message || "Une erreur est survenue lors de la mise à jour");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        <p className="mt-4 text-gray-600">Chargement du cours...</p>
      </main>
    );
  }

  if (!isAuthorized) {
    return (
      <main className="p-6 text-center space-y-4">
        <p className="text-red-600 text-sm md:text-base">
          {error || "Vous n'avez pas la permission d'accéder à cette page."}
        </p>
        <button
          onClick={() => router.push(`/cours/detail/${id}`)}
          className="px-4 py-2 bg-blue-900 text-white rounded-lg"
        >
          Retour au cours
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">
        Modifier le cours
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      {submitting && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-600">Sauvegarde en cours...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold mb-1">
            Intitulé du cours
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(event) => handleInputChange("title", event.target.value)}
            className="w-full border rounded-lg p-2"
            placeholder="Ex : VBA - Excel"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(event) =>
              handleInputChange("description", event.target.value)
            }
            className="w-full border rounded-lg p-2"
            placeholder="Description détaillée"
            maxLength={350}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Nombre max. de participants
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={formData.maxParticipants}
            onChange={(event) =>
              handleInputChange("maxParticipants", Number(event.target.value))
            }
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Catégorie</label>
          {categoriesLoading ? (
            <div className="w-full border rounded-lg p-2 bg-gray-50 text-gray-500">
              Chargement des catégories...
            </div>
          ) : categories.length === 0 ? (
            <div className="w-full border rounded-lg p-2 bg-yellow-50 text-yellow-700">
              Aucune catégorie disponible
            </div>
          ) : (
            <select
              value={formData.category}
              onChange={(event) =>
                handleInputChange("category", event.target.value)
              }
              className="w-full border rounded-lg p-2"
              required
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Niveau</label>
          <select
            value={formData.level}
            onChange={(event) => handleInputChange("level", event.target.value)}
            className="w-full border rounded-lg p-2"
            required
          >
            {levelOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Prix par heure (€)
          </label>
          <input
            type="number"
            min={0}
            step={1}
            value={formData.pricePerHour}
            onChange={(event) =>
              handleInputChange("pricePerHour", Number(event.target.value))
            }
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push(`/cours/detail/${id}`)}
            className="flex-1 py-2 rounded-lg border border-blue-900 text-blue-900"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`flex-1 py-2 rounded-lg font-semibold text-white ${
              submitting ? "bg-blue-300" : "bg-blue-900 hover:bg-blue-800"
            }`}
          >
            {submitting ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </main>
  );
}
