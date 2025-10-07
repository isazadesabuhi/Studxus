"use client"; // 👈 À AJOUTER TOUT EN HAUT, avant tout import
// pages/proposer-cours/tarif.tsx
import React from "react";
import { useRouter } from "next/navigation";

import MobileLayout from "@/app/components/MobileLayout";
import Button from "@/app/components/Buttons";
import StepIndicator from "@/app/components/StepIndicator";

export default function TarifPage() {
  const router = useRouter();

  return (
    <MobileLayout title="Tarif">
      <div className="p-4">
        <StepIndicator currentStep={3} steps={["Sujet", "Date & Lieu", "Tarif"]} />

        <form className="flex flex-col gap-3 border-2 border-alternative rounded-2xl p-4 bg-white">
          <input
            type="number"
            placeholder="Tarif par séance (€)"
            className="border placeholder-primary text-primary  rounded-md px-3 py-2"
          />
          <textarea
            placeholder="Informations supplémentaires"
            rows={3}
            className="border placeholder-primary text-primary  rounded-md px-3 py-2"
          />
        </form>

        <div className="mt-6">
          <Button variant="primary" onClick={() => alert("Cours proposé !")}>
            Valider
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
