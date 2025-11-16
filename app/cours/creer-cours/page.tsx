"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import CourseFormStep1 from "@/components/CourseFormStep1";
import CourseFormStep2 from "@/components/CourseFormStep2";
import CourseFormStep3 from "@/components/CourseFormStep3";
import CourseFormRecap from "@/components/CourseFormRecap";

export default function CreateCoursePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [createdCourseId, setCreatedCourseId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    maxParticipants: 5,
    category: "",

    // Session details - Step 2
    date: "",
    startTime: "",
    endTime: "",
    location: "5 rue François Dauphin, 69002 Lyon",

    // Pricing - Step 3
    level: "Débutant",
    price: 10,
  });

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await fetch("/api/users/interests", {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await response.json();
        const availableCategories = data?.available_interests || [];
        setCategories(availableCategories);

        // Set first category as default if available
        if (availableCategories.length > 0 && !formData.category) {
          setFormData((prev) => ({
            ...prev,
            category: availableCategories[0],
          }));
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Impossible de charger les catégories");
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  // Handle course submission when triggered from Step 3
  const handleCourseSubmit = async (shouldSubmit: boolean) => {
    if (!shouldSubmit) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Get the current user session
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        throw new Error("Vous devez être connecté pour créer un cours");
      }

      // Step 1: Create the course
      const courseRequestBody = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        level: formData.level,
        pricePerHour: formData.price,
        maxParticipants: formData.maxParticipants,
      };

      const courseResponse = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify(courseRequestBody),
      });

      if (!courseResponse.ok) {
        const errorData = await courseResponse.json();
        throw new Error(errorData.error || "Échec de la création du cours");
      }

      const courseResult = await courseResponse.json();
      const courseId = courseResult.course.id;
      setCreatedCourseId(courseId);

      console.log("Course created successfully:", courseResult);

      // Step 2: Create a session for the course if date/time are provided
      if (formData.date && formData.startTime && formData.endTime) {
        const sessionRequestBody = {
          sessionDate: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          maxParticipants: formData.maxParticipants,
          location: formData.location || null,
        };

        const sessionResponse = await fetch(
          `/api/courses/${courseId}/sessions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionData.session.access_token}`,
            },
            body: JSON.stringify(sessionRequestBody),
          }
        );

        if (!sessionResponse.ok) {
          const sessionErrorData = await sessionResponse.json();
          console.error("Session creation failed:", sessionErrorData);
          // Don't throw error - course is created, session creation is optional
          setError(
            "Cours créé mais échec de la création de la session. Vous pouvez ajouter une session plus tard."
          );
        } else {
          const sessionResult = await sessionResponse.json();
          console.log("Session created successfully:", sessionResult);
        }
      }

      // Move to success screen
      nextStep();
    } catch (err: any) {
      console.error("Error creating course:", err);
      setError(
        err.message || "Une erreur s'est produite lors de la création du cours"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm">
      {/* Show error message if any */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Show loading overlay when submitting */}
      {isSubmitting && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-600">Création du cours en cours...</p>
        </div>
      )}

      {/* Show loading state for categories */}
      {categoriesLoading && step === 1 && (
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">Chargement des catégories...</p>
        </div>
      )}

      {step === 1 && (
        <CourseFormStep1
          data={formData}
          onNext={nextStep}
          onUpdate={updateFormData}
          categories={categories}
          categoriesLoading={categoriesLoading}
        />
      )}
      {step === 2 && (
        <CourseFormStep2
          data={formData}
          onPrev={() => setStep(1)}
          onNext={() => setStep(3)}
          onUpdate={(field, value) =>
            setFormData({ ...formData, [field]: value })
          }
        />
      )}
      {step === 3 && (
        <CourseFormStep3
          data={formData}
          onPrev={prevStep}
          onUpdate={updateFormData}
          onSubmit={handleCourseSubmit}
        />
      )}
      {step === 4 && <CourseFormRecap />}
    </main>
  );
}
