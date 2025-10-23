"use client";

import { useState } from "react";
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

  const [formData, setFormData] = useState({
    title: "",
    shortDesc: "",
    description: "",
    maxParticipants: 5,
    category: "Informatique",

    // Champs utilisés dans Step 2
    date: "",
    startTime: "",
    endTime: "",

    level: "Tous niveaux",
    price: 10,
  });

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

      // Prepare the request body according to the API schema
      const requestBody = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDesc,
        category: formData.category,
        level: formData.level,
        pricePerHour: formData.price,
        maxParticipants: formData.maxParticipants,
      };

      // Make POST request to /api/courses
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Échec de la création du cours");
      }

      const result = await response.json();
      console.log("Course created successfully:", result);

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

      {step === 1 && (
        <CourseFormStep1
          data={formData}
          onNext={nextStep}
          onUpdate={updateFormData}
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
          onNext={nextStep}
          onPrev={prevStep}
          onUpdate={updateFormData}
          onSubmit={handleCourseSubmit}
        />
      )}
      {step === 4 && <CourseFormRecap data={formData} />}
    </main>
  );
}
