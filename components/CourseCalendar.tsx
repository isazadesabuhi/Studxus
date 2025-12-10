"use client";

import data from "@/data/courses.json";
import React, { useEffect, useMemo, useState } from "react";

interface CourseCalendarProps {
  courseId: string;
}

const CourseCalendar: React.FC<CourseCalendarProps> = ({ courseId }) => {
  const selectedCourse = useMemo(
    () => data.find((course) => course.id === courseId),
    [courseId]
  );

  // Flatten date array to an object for quick lookups
  const calendarData = useMemo(() => {
    if (!selectedCourse) return {};
    return Object.assign({}, ...selectedCourse.date);
  }, [selectedCourse]);

  const dates = useMemo(() => Object.keys(calendarData), [calendarData]);

  const [selectedDate, setSelectedDate] = useState<string>(dates[0] || "");
  const [selectedHour, setSelectedHour] = useState<string | null>(null);

  // Reset selection when course or dates change
  useEffect(() => {
    setSelectedDate(dates[0] || "");
    setSelectedHour(null);
  }, [courseId, dates]);

  const hours = calendarData[selectedDate] || [];

  if (!selectedCourse) {
    return <p className="text-center text-gray-500">Cours introuvable.</p>;
  }

  return (
    <div className="w-full mt-4 text-center">
      <h2 className="text-lg font-semibold mb-2">📅 Selectionne une date</h2>

      {/* Dates */}
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

      {/* Time slots */}
      <h3 className="text-md font-semibold mt-4 mb-2">⏰ Creneaux disponibles</h3>
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
          <p className="text-gray-500 italic">Aucun creneau ce jour.</p>
        )}
      </div>

      {/* Reserve button */}
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
          {selectedHour ? `Reserver le ${selectedHour}` : "Choisis un creneau"}
        </button>
      </div>
    </div>
  );
};

export default CourseCalendar;
