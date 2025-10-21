"use client";

import data from "@/data/courses.json";
import React, { useState } from "react";

interface CourseCalendarProps {
  courseId: string;
}

const CourseCalendar: React.FC<CourseCalendarProps> = ({ courseId }) => {
  // On récupère le cours correspondant
  const selectedCourse = data.find((course) => course.id === courseId);

  if (!selectedCourse) {
    return <p className="text-center text-gray-500">Cours introuvable.</p>;
  }

  // On transforme le tableau "date" en objet clé-valeur
  const calendarData = Object.assign({}, ...selectedCourse.date);

  // Liste des dates disponibles (ex: ["2025-10-07", "2025-10-14", "2025-10-21"])
  const dates = Object.keys(calendarData);

  // État pour la date et l'heure sélectionnée
  const [selectedDate, setSelectedDate] = useState<string>(dates[0]);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);

  const hours = calendarData[selectedDate] || [];

  return (
    <div className="w-full mt-4 text-center">
      <h2 className="text-lg font-semibold mb-2">📅 Sélectionne une date</h2>

      {/* --- Dates --- */}
      <div className="flex justify-center gap-2 overflow-x-auto py-2">
        {dates.map((date) => {
          const day = new Date(date).toLocaleDateString("fr-FR", {
            weekday: "short",
            day: "2-digit",
            month: "short",
          });

          return (
            <button
              key={date}
              onClick={() => {
                setSelectedDate(date);
                setSelectedHour(null);
              }}
              className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl font-semibold ${
                selectedDate === date
                  ? "bg-primary text-white"
                  : "bg-blue-50 text-primary"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* --- Horaires --- */}
      <h3 className="text-md font-semibold mt-4 mb-2">
        🕒 Créneaux disponibles
      </h3>
      <div className="flex justify-center flex-wrap gap-2">
        {hours.length > 0 ? (
          hours.map((hour: string) => (
            <button
              key={hour}
              onClick={() => setSelectedHour(hour)}
              className={`px-4 py-2 rounded-2xl border font-medium transition-all
                ${
                  selectedHour === hour
                    ? "bg-primary text-white border-primary"
                    : "bg-white border-gray-300 hover:bg-gray-100"
                }`}
            >
              {hour}
            </button>
          ))
        ) : (
          <p className="text-gray-500 italic">Aucun créneau ce jour.</p>
        )}
      </div>

      {/* --- Bouton Réserver --- */}
      <div className="mt-6">
        <button
          disabled={!selectedHour}
          className={`w-3/4 py-3 rounded-full font-semibold text-white transition
            ${
              selectedHour
                ? "bg-primary hover:bg-primary/90"
                : "bg-gray-300 cursor-not-allowed"
            }`}
        >
          {selectedHour ? `Réserver le ${selectedHour}` : "Choisis un créneau"}
        </button>
      </div>
    </div>
  );
};

export default CourseCalendar;
