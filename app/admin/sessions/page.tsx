"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface Course {
  id: string;
  title: string;
}

interface Session {
  id: string;
  course_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  max_participants: number;
  current_participants: number;
  location: string | null;
}

export default function ManageSessionsPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Form state
  const [formData, setFormData] = useState({
    sessionDate: "",
    startTime: "18:30",
    endTime: "19:30",
    maxParticipants: 5,
    location: "",
  });

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/");
          return;
        }

        const response = await fetch(`/api/courses?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setCourses(data.courses || []);
          if (data.courses && data.courses.length > 0) {
            setSelectedCourseId(data.courses[0].id);
          }
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    };

    fetchCourses();
  }, [router]);

  // Fetch sessions when course is selected
  useEffect(() => {
    if (selectedCourseId) {
      fetchSessions();
    }
  }, [selectedCourseId]);

  const fetchSessions = async () => {
    if (!selectedCourseId) return;

    try {
      const response = await fetch(`/api/courses/${selectedCourseId}/sessions`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
    }
  };

  const createSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (!selectedCourseId) {
      setError("Veuillez sélectionner un cours");
      setLoading(false);
      return;
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        throw new Error("Vous devez être connecté");
      }

      const response = await fetch(
        `/api/courses/${selectedCourseId}/sessions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionData.session.access_token}`,
          },
          body: JSON.stringify({
            sessionDate: formData.sessionDate,
            startTime: formData.startTime,
            endTime: formData.endTime,
            maxParticipants: formData.maxParticipants,
            location: formData.location,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Erreur lors de la création de la session"
        );
      }

      setMessage(`✅ Session créée avec succès !`);
      setFormData({
        ...formData,
        sessionDate: "",
      });
      fetchSessions();
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || "Une erreur s'est produite");
    } finally {
      setLoading(false);
    }
  };

  // const deleteSession = async (sessionId: string) => {
  //   if (!confirm("Êtes-vous sûr de vouloir supprimer cette session ?")) {
  //     return;
  //   }

  //   try {
  //     // Note: You'll need to create a DELETE endpoint for sessions
  //     setMessage("Fonctionnalité de suppression à venir");
  //   } catch (err: any) {
  //     setError(err.message);
  //   }
  // };

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

  return (
    <main className="mx-auto max-w-screen-sm bg-white min-h-screen p-6">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-900 font-semibold mb-3"
        >
          ← Retour
        </button>
        <h1 className="text-2xl font-bold text-blue-900">
          📅 Gérer les Sessions
        </h1>
        <p className="text-gray-600 text-sm mt-2">
          {
            "Créez des sessions pour vos cours afin qu'ils puissent être réservés"
          }
        </p>
      </div>

      {/* Course Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sélectionner un cours
        </label>
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900"
        >
          <option value="">-- Choisir un cours --</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      {/* Create Session Form */}
      {selectedCourseId && (
        <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Créer une Nouvelle Session
          </h2>

          <form onSubmit={createSession} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de la session *
              </label>
              <input
                type="date"
                value={formData.sessionDate}
                onChange={(e) =>
                  setFormData({ ...formData, sessionDate: e.target.value })
                }
                required
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure de début *
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure de fin *
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre maximum de participants
              </label>
              <input
                type="number"
                value={formData.maxParticipants}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxParticipants: parseInt(e.target.value) || 5,
                  })
                }
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lieu
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="Adresse du cours"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-900 hover:bg-blue-800"
              }`}
            >
              {loading ? "Création..." : "Créer la Session"}
            </button>

            {message && (
              <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {message}
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
          </form>
        </div>
      )}

      {/* Existing Sessions */}
      {selectedCourseId && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Sessions Existantes ({sessions.length})
          </h2>

          {sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Aucune session créée pour ce cours</p>
              <p className="text-sm mt-2">
                Créez une session ci-dessus pour commencer
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-white border-2 border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {formatDate(session.session_date)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {session.start_time} - {session.end_time}
                      </p>
                      {session.location && (
                        <p className="text-sm text-gray-600 mt-1">
                          📍 {session.location}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mt-1">
                        Participants: {session.current_participants}/
                        {session.max_participants}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {courses.length === 0 && (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-yellow-800 text-sm">
            ⚠️{"Vous n'avez pas encore créé de cours."}
            <button
              onClick={() => router.push("/cours/creer-cours")}
              className="underline font-semibold"
            >
              Créez un cours
            </button>
            {"d'abord."}
          </p>
        </div>
      )}
    </main>
  );
}
