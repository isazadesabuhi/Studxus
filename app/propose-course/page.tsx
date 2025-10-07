"use client"; // 👈 À AJOUTER TOUT EN HAUT, avant tout import
// pages/proposer-cours/index.tsx
import React from "react";
import { useRouter } from "next/navigation";

import MobileLayout from "@/app/components/MobileLayout";
import StepIndicator from "@/app/components/StepIndicator";
import Button from "@/app/components/Buttons";

export default function SujetPage() {
  const router = useRouter();

  return (
    <MobileLayout title="Proposer un cours">
      <div className="p-4">
        <StepIndicator currentStep={1} steps={["Sujet", "Date & Lieu", "Tarif"]} />

        <form className="flex flex-col gap-3 border-2 border-alternative rounded-2xl p-4 bg-white">
          <input
            type="text"
            placeholder="Intitulé du cours"
            className="border placeholder-primary text-primary rounded-md px-3 py-2"
          />
          <input
            type="text"
            placeholder="Sous-titre (facultatif)"
            className="border placeholder-primary text-primary  rounded-md px-3 py-2"
          />
          <input
            type="text"
            placeholder="Descriptif"
            className="border placeholder-primary text-primary  rounded-md px-3 py-2"
          />
          <textarea
            placeholder="Description"
            rows={4}
            className="border placeholder-primary text-primary  rounded-md px-3 py-2"
          />
        </form>

        <div className="mt-6 flex justify-end">
          <Button variant="primary" onClick={() => router.push("/propose-course/date-place")}>
            Suivant →
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
