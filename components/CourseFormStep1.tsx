import { useState } from "react";
import ProgressBar from "./ProgressBar";

interface Props {
  data: any;
  onNext: () => void;
  onUpdate: (updates: any) => void;
  categories: string[];
  categoriesLoading: boolean;
}

export default function CourseFormStep1({ 
  data, 
  onNext, 
  onUpdate,
  categories,
  categoriesLoading 
}: Props) {
  return (
    <div>
      {/* Barre de progression */}
      <ProgressBar step={1} />
      <h2 className="text-xl font-bold mb-4 text-blue-900">
        Définissez le sujet de votre cours
      </h2>

      <label className="block text-sm font-semibold mb-1">Intitulé du cours</label>
      <input
        type="text"
        value={data.title}
        onChange={(e) => onUpdate({ title: e.target.value })}
        className="w-full border rounded-lg p-2 mb-3"
        placeholder="Ex : VBA - Excel"
      />

      <label className="block text-sm font-semibold mb-1">Descriptif</label>
      <textarea
        value={data.shortDesc}
        onChange={(e) => onUpdate({ shortDesc: e.target.value })}
        className="w-full border rounded-lg p-2 mb-3"
        placeholder="Texte court (150 caractères max)"
        maxLength={150}
      />

      <label className="block text-sm font-semibold mb-1">Description</label>
      <textarea
        value={data.description}
        onChange={(e) => onUpdate({ description: e.target.value })}
        className="w-full border rounded-lg p-2 mb-3"
        placeholder="Description détaillée"
        maxLength={350}
      />

      <label className="block text-sm font-semibold mb-1">
        Nombre max. de participants
      </label>
      <input
        type="number"
        min={1}
        max={20}
        value={data.maxParticipants}
        onChange={(e) => onUpdate({ maxParticipants: Number(e.target.value) })}
        className="w-full border rounded-lg p-2 mb-3"
      />

      <label className="block text-sm font-semibold mb-1">Catégorie</label>
      {categoriesLoading ? (
        <div className="w-full border rounded-lg p-2 mb-5 bg-gray-50 text-gray-500">
          Chargement des catégories...
        </div>
      ) : categories.length === 0 ? (
        <div className="w-full border rounded-lg p-2 mb-5 bg-yellow-50 text-yellow-700">
          Aucune catégorie disponible
        </div>
      ) : (
        <select
          value={data.category}
          onChange={(e) => onUpdate({ category: e.target.value })}
          className="w-full border rounded-lg p-2 mb-5"
          disabled={categoriesLoading}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      )}

      <button
        onClick={onNext}
        disabled={categoriesLoading || !data.category}
        className={`w-full py-3 rounded-xl font-semibold transition-all ${
          categoriesLoading || !data.category
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-blue-900 text-white hover:bg-blue-800"
        }`}
      >
        {categoriesLoading ? "Chargement..." : "Suivant"}
      </button>
    </div>
  );
}