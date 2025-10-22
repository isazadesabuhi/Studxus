"use client";

import { useState } from "react";
import CourseFormStep1 from "@/components/CourseFormStep1";
import CourseFormStep2 from "@/components/CourseFormStep2";
import CourseFormStep3 from "@/components/CourseFormStep3";
import CourseFormRecap from "@/components/CourseFormRecap";

export default function CreateCoursePage() {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    title: "",
    shortDesc: "",
    description: "",
    maxParticipants: 5,
    category: "Informatique",

    // ⬇️ Champs utilisés dans Step 2
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

  return (
    <main className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm">
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
        />
      )}
      {step === 4 && <CourseFormRecap data={formData} />}
    </main>
  );
}
