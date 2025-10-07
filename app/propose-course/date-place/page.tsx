"use client"; // 👈 À AJOUTER TOUT EN HAUT, avant tout import
// pages/proposer-cours/date-lieu.tsx
import React from "react";
import { useRouter } from "next/navigation";

import MobileLayout from "@/app/components/MobileLayout";
import Button from "@/app/components/Buttons";
import StepIndicator from "@/app/components/StepIndicator";

export default function DateLieuPage() {
  const router = useRouter();

  return (
    <MobileLayout title="Date et Lieu">
      <div className="p-4">
        <StepIndicator currentStep={2} steps={["Sujet", "Date & Lieu", "Tarif"]} />

        <form className="flex flex-col gap-3 border-2 border-alternative rounded-2xl p-4 bg-white">
          <input
            type="text"
            placeholder="Adresse du cours"
            className="border placeholder-primary rounded-md px-3 py-2"
          />
          <button
            type="button"
            className="bg-blue-100 text-blue-700 rounded-full py-2"
          >
            + Ajouter une date
          </button>
        </form>

        <div className="mt-6 flex justify-between">
          <Button variant="secondary" onClick={() => router.back()}>
            ← Précédent
          </Button>
          <Button variant="primary" onClick={() => router.push("/propose-course/price")}>
            Suivant →
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
