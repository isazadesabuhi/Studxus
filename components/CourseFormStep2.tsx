"use client";

import ProgressBar from "./ProgressBar";

interface CourseFormStep2Props {
  data: {
    date?: string;
    startTime?: string;
    endTime?: string;
  };
  onPrev: () => void;
  onNext: () => void;
  onUpdate: (field: string, value: string) => void;
}

export default function CourseFormStep2({ data, onPrev, onNext, onUpdate }: CourseFormStep2Props) {
  return (
    <div className="p-4 max-w-md mx-auto">
      {/* ✅ Barre de progression */}
      <ProgressBar step={2} />

      <h2 className="text-xl font-bold mb-6 text-blue-900">
        Choisissez vos créneaux de cours
      </h2>

      {/* Sélection de date */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date du cours
        </label>
        <input
          type="date"
          value={data.date || ""}
          onChange={(e) => onUpdate("date", e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        />
      </div>

      {/* Heures de début et de fin */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Heure de début
          </label>
          <input
            type="time"
            value={data.startTime || ""}
            onChange={(e) => onUpdate("startTime", e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Heure de fin
          </label>
          <input
            type="time"
            value={data.endTime || ""}
            onChange={(e) => onUpdate("endTime", e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
          />
        </div>
      </div>

      {/* Boutons navigation */}
      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={onPrev}
          className="text-blue-900 border border-blue-900 px-4 py-2 rounded-full hover:bg-blue-50"
        >
          ← Retour
        </button>

        <button
          type="button"
          onClick={onNext}
          className="bg-primary text-white px-6 py-2 rounded-full hover:bg-blue-800"
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}
