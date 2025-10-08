"use client";

import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose }) => {
  const [priceRange, setPriceRange] = useState<[number, number]>([3, 15]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-[90%] max-w-md bg-white rounded-2xl p-5 shadow-lg">
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-700 hover:text-black"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Tags sélectionnés */}
        <div className="flex flex-wrap gap-2 mb-4">
          {["En ligne", "Présentiel", "4⭐ ou +", "Jardinage", "Proche de chez moi"].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-gray-100 rounded-lg border text-sm flex items-center gap-1"
            >
              {tag}
              <button className="text-gray-500 hover:text-gray-700 text-xs">✕</button>
            </span>
          ))}
        </div>

        {/* Sections filtres */}
        <div className="space-y-4">
          {["Catégories", "Niveaux", "Disponibilités", "Avis"].map((section) => (
            <div
              key={section}
              className="flex justify-between items-center py-2 border-b border-gray-100"
            >
              <span className="font-semibold text-gray-800">{section}</span>
              <span className="text-gray-400">{">"}</span>
            </div>
          ))}

          {/* Filtre de prix */}
          <div>
            <p className="font-semibold text-gray-800 mb-2">Prix</p>
            <input
              type="range"
              min={0}
              max={25}
              step={1}
              value={priceRange[0]}
              onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
              className="w-full accent-black"
            />
            <input
              type="range"
              min={0}
              max={25}
              step={1}
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="w-full accent-black"
            />
            <div className="flex justify-between text-sm mt-1">
              <span>0€</span>
              <span>25€</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-indigo-900">
              Prix : {priceRange[0]}€ - {priceRange[1]}€
            </p>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="mt-6 flex flex-col gap-3">
          <button className="bg-indigo-900 text-white font-semibold py-2 rounded-xl">
            Filtrer
          </button>
          <button className="border-2 border-indigo-900 text-indigo-900 font-semibold py-2 rounded-xl">
            Réinitialiser
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
