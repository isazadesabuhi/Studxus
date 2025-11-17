"use client";

import { MapPin, BarChart3, Clock } from "lucide-react";

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  level: string;
  pricePerHour: number;
  author: {
    id: string;
    name: string;
    surname: string;
    fullName: string;
    email: string;
  } | null;
}

interface CourseSession {
  id: string;
  session_date: string; // ← snake_case
  start_time: string; // ← snake_case
  end_time: string; // ← snake_case
  location: string | null;
}

interface ReservationStep1Props {
  course: CourseDetail;
  sessions: CourseSession[];
  selectedSession: CourseSession | null;
  onSessionSelect: (session: CourseSession) => void;
  formData: {
    messageToInstructor: string;
  };
  onFormDataChange: (data: any) => void;
  onNext: () => void;
}

export default function ReservationStep1({
  course,
  sessions,
  selectedSession,
  onSessionSelect,
  formData,
  onFormDataChange,
  onNext,
}: ReservationStep1Props) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const months = [
      "janv.",
      "févr.",
      "mars",
      "avr.",
      "mai",
      "juin",
      "juil.",
      "août",
      "sept.",
      "oct.",
      "nov.",
      "déc.",
    ];
    return `${days[date.getDay()]}, ${date.getDate()} ${
      months[date.getMonth()]
    }`;
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    return `${hours}h${minutes}`;
  };

  const totalPrice = course.pricePerHour;

  const canProceed = selectedSession !== null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Vérifiez vos informations de réservation
      </h1>

      {/* Course Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Intitulé du cours
        </label>
        <input
          type="text"
          value={course.title}
          disabled
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900"
        />
      </div>

      {/* Session Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Prochaines dates
        </label>
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Aucune session disponible pour ce cours
            </p>
          ) : (
            sessions.slice(0, 6).map((session) => {
              const isSelected = selectedSession?.id === session.id;
              const dateFormatted = formatDate(session.session_date);
              const timeFormatted = `${formatTime(
                session.start_time
              )} - ${formatTime(session.end_time)}`;

              return (
                <div
                  key={session.id}
                  className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? "border-blue-900 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => onSessionSelect(session)}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {dateFormatted} {timeFormatted}
                    </p>
                    {session.location && (
                      <p className="text-sm text-gray-600 mt-1">
                        <MapPin className="inline w-4 h-4 mr-1" />
                        {session.location}
                      </p>
                    )}
                  </div>
                  <button
                    className={`px-4 py-2 rounded-lg font-medium ${
                      isSelected
                        ? "bg-blue-900 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {isSelected ? "Sélectionné" : "Réserver"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Course Details */}
      {selectedSession && (
        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <MapPin className="w-4 h-4" />
            <span>
              {selectedSession.location}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <BarChart3 className="w-4 h-4" />
            <span>{course.level}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Clock className="w-4 h-4" />
            <span>
              {formatTime(selectedSession.start_time)} -{" "}
              {formatTime(selectedSession.end_time)}
            </span>
          </div>
        </div>
      )}

      {/* Price Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-900">Prix total</span>
          <span className="text-xl font-bold text-blue-900">
            {totalPrice.toFixed(2)}€
          </span>
        </div>
      </div>

      {/* Message to Instructor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Envoyez un message à {course.author?.fullName || "l'instructeur"} pour
          vous présenter
        </label>
        <textarea
          value={formData.messageToInstructor}
          onChange={(e) =>
            onFormDataChange({
              ...formData,
              messageToInstructor: e.target.value,
            })
          }
          placeholder="Bonjour, j'aimerais en savoir plus sur..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 min-h-[120px] resize-none"
          rows={4}
        />
      </div>

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={!canProceed}
        className={`w-full py-4 rounded-lg font-semibold text-white transition-all ${
          canProceed
            ? "bg-blue-900 hover:bg-blue-800"
            : "bg-gray-300 cursor-not-allowed"
        }`}
      >
        Suivant
      </button>
    </div>
  );
}
