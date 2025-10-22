import { useState } from "react";
import ProgressBar from "./ProgressBar";

interface Props {
  data: any;
  onNext: () => void;
  onUpdate: (updates: any) => void;
}

export default function CourseFormStep1({ data, onNext, onUpdate }: Props) {
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
      <select
        value={data.category}
        onChange={(e) => onUpdate({ category: e.target.value })}
        className="w-full border rounded-lg p-2 mb-5"
      >
        <option>Informatique</option>
        <option>Langues</option>
        <option>Musique</option>
        <option>Jardinage</option>
      </select>

      <button
        onClick={onNext}
        className="w-full bg-blue-900 text-white py-3 rounded-xl font-semibold"
      >
        Suivant
      </button>
    </div>
  );
}
