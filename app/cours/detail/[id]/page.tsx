"use client";

import { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import vba from "@/public/vba.jpg";

type TabKey = "description" | "date" | "similaire";

interface CourseDetail {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  level: string;
  pricePerHour: number;
  maxParticipants: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    surname: string;
    fullName: string;
    email: string;
    userType: string;
  } | null;
}

interface CourseSession {
  id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  location: string | null;
  max_participants: number;
  current_participants: number;
}

export default function CourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [active, setActive] = useState<TabKey>("description");
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [sessions, setSessions] = useState<CourseSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactLoading, setContactLoading] = useState(false);

  // Fetch course details and check ownership
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setCurrentUser(user);

        // Fetch course details
        const response = await fetch(`/api/courses/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Cours introuvable");
          }
          throw new Error("Échec du chargement du cours");
        }

        const data = await response.json();
        setCourse(data.course);

        // Check if current user is the course owner
        if (user && data.course.userId === user.id) {
          setIsOwner(true);
        }

        // Fetch available sessions
        const sessionsResponse = await fetch(`/api/courses/${id}/sessions`);
        if (sessionsResponse.ok) {
          const sessionsData = await sessionsResponse.json();
          setSessions(sessionsData.sessions || []);
          if (sessionsData.sessions && sessionsData.sessions.length > 0) {
            setSelectedSessionId(sessionsData.sessions[0].id);
          }
        }
      } catch (err: any) {
        console.error("Error fetching course:", err);
        setError(err.message || "Une erreur s'est produite");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourseDetails();
    }
  }, [id]);

  const handleBookCourse = async () => {
    if (!currentUser) {
      alert("Vous devez être connecté pour réserver un cours");
      router.push("/");
      return;
    }

    if (isOwner) {
      alert("Vous ne pouvez pas réserver votre propre cours");
      return;
    }

    if (!selectedSessionId) {
      alert("Veuillez sélectionner une date pour réserver");
      setActive("date");
      return;
    }

    // Redirect to reservation page
    router.push(`/cours/reserver/${id}?sessionId=${selectedSessionId}`);
  };

  // const handleEditCourse = () => {
  //   router.push(`/cours/modifier/${id}`);
  // };

  // const handleDeleteCourse = async () => {
  //   if (!confirm("Êtes-vous sûr de vouloir supprimer ce cours ?")) {
  //     return;
  //   }

  //   try {
  //     const { data: sessionData } = await supabase.auth.getSession();

  //     if (!sessionData.session) {
  //       throw new Error("Session expirée");
  //     }

  //     const response = await fetch(`/api/courses/${id}`, {
  //       method: "DELETE",
  //       headers: {
  //         Authorization: `Bearer ${sessionData.session.access_token}`,
  //       },
  //     });

  //     if (!response.ok) {
  //       throw new Error("Échec de la suppression");
  //     }

  //     alert("Cours supprimé avec succès");
  //     router.push("/cours");
  //   } catch (err: any) {
  //     alert(err.message || "Erreur lors de la suppression");
  //   }
  // };

  const handleContactTeacher = () => {
    if (!currentUser) {
      alert("Vous devez être connecté pour contacter l'enseignant");
      router.push("/");
      return;
    }

    // TODO: Implement messaging functionality
    if (!course?.author?.id) {
      alert("Impossible de contacter cet enseignant pour le moment");
      return;
    }

    setContactError(null);
    setShowContactForm(true);
  };

  const handleSubmitContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!course?.author?.id) {
      setContactError("Impossible de trouver l'enseignant du cours");
      return;
    }

    if (!contactMessage.trim()) {
      setContactError("Veuillez écrire un message avant d'envoyer");
      return;
    }

    try {
      setContactLoading(true);
      setContactError(null);

      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        setContactError("Votre session a expiré. Veuillez vous reconnecter.");
        return;
      }

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({
          recipientId: course.author.id,
          subject: contactSubject.trim() ? contactSubject.trim() : null,
          message: contactMessage.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const errorMessage = data?.error || "Échec de l'envoi du message";
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const conversationId = data?.message?.conversation_id;

      setContactMessage("");
      setContactSubject("");
      setShowContactForm(false);

      if (conversationId) {
        router.push(`/message/${conversationId}`);
      } else {
        router.push("/message");
      }
    } catch (err: any) {
      console.error("Error sending message:", err);
      setContactError(
        err?.message || "Une erreur est survenue lors de l'envoi du message"
      );
    } finally {
      setContactLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-4 text-gray-600">Chargement du cours...</p>
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="p-6 text-center">
        <p className="text-red-600 mb-4">{error || "Cours introuvable"} 😕</p>
        <button
          onClick={() => router.push("/search")}
          className="px-4 py-2 bg-blue-900 text-white rounded-lg"
        >
          Retour à la recherche
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-screen-sm bg-white rounded-lg shadow-sm">
      {/* --- En-tête --- */}
      <div className="p-4">
        <button
          onClick={() => router.back()}
          className="text-blue-900 font-semibold mb-3"
        >
          ← Retour
        </button>

        <div className="flex items-center gap-4 mb-4">
          <Image
            src={vba}
            alt={course.title}
            className="w-20 h-20 rounded-lg object-cover"
          />
          <div>
            <h1 className="text-2xl font-bold text-blue-900">{course.title}</h1>
            <p className="text-gray-700 text-sm mt-1">{course.description}</p>
          </div>
        </div>

        {/* --- Course Info Cards --- */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600">Prix</p>
            <p className="text-lg font-bold text-blue-900">
              {course.pricePerHour}€/h
            </p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600">Niveau</p>
            <p className="text-lg font-bold text-blue-900">{course.level}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600">Catégorie</p>
            <p className="text-lg font-bold text-blue-900">{course.category}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600">Places</p>
            <p className="text-lg font-bold text-blue-900">
              Max {course.maxParticipants}
            </p>
          </div>
        </div>

        {/* --- Enseignant --- */}
        <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg mb-6">
          <div>
            <p className="font-semibold text-blue-900">
              {course.author?.fullName || "Anonyme"}
            </p>
            <p className="text-sm text-gray-600">
              {course.author?.userType || "Enseignant"}
            </p>
          </div>
          {!isOwner && course.author?.id && (
            <button
              onClick={handleContactTeacher}
              className="text-blue-900 border border-blue-900 rounded-full px-3 py-1 text-sm hover:bg-blue-100"
            >
              Contacter
            </button>
          )}
        </div>

        {/* --- Owner Actions --- */}
        {!isOwner && showContactForm && (
          <div className="mb-6 p-4 border border-blue-100 rounded-lg bg-blue-50">
            <form className="space-y-3" onSubmit={handleSubmitContact}>
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-1">
                  Sujet (optionnel)
                </label>
                <input
                  type="text"
                  value={contactSubject}
                  onChange={(event) => setContactSubject(event.target.value)}
                  placeholder={`Message à ${course.author?.fullName}`}
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-1">
                  Message
                </label>
                <textarea
                  value={contactMessage}
                  onChange={(event) => setContactMessage(event.target.value)}
                  placeholder="Présentez-vous et expliquez votre demande"
                  rows={4}
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {contactError && (
                <p className="text-sm text-red-600">{contactError}</p>
              )}

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowContactForm(false);
                    setContactMessage("");
                    setContactSubject("");
                    setContactError(null);
                  }}
                  className="px-3 py-2 text-sm text-blue-900 hover:underline"
                  disabled={contactLoading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={contactLoading}
                  className="px-4 py-2 bg-blue-900 text-white rounded-full text-sm font-medium hover:bg-blue-800 disabled:opacity-60"
                >
                  {contactLoading ? "Envoi..." : "Envoyer"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- Onglets --- */}
        <div className="flex justify-between w-full mx-auto gap-6 border-b border-gray-200 px-3 sm:px-4">
          <button
            onClick={() => setActive("description")}
            className={`py-3 text-sm font-medium ${
              active === "description"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActive("date")}
            className={`py-3 text-sm font-medium ${
              active === "date"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
            }`}
          >
            Dates
          </button>
          {/* <button
            onClick={() => setActive("similaire")}
            className={`py-3 text-sm font-medium ${
              active === "similaire"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
            }`}
          >
            Similaires
          </button> */}
        </div>

        {/* --- Contenu Onglets --- */}
        <div className="mt-4">
          {active === "description" ? (
            <div className="text-gray-700 leading-relaxed px-2">
              <p className="mb-4 whitespace-pre-line">{course.description}</p>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Informations complémentaires
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Créé le:</span>{" "}
                    {new Date(course.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                  <p>
                    <span className="font-medium">Dernière mise à jour:</span>{" "}
                    {new Date(course.updatedAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
            </div>
          ) : active === "date" ? (
            <div className="px-2">
              <h3 className="font-semibold text-gray-900 mb-4">
                Prochaines dates
              </h3>
              {sessions.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <p>Aucune session disponible pour ce cours</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => {
                    const date = new Date(session.session_date);
                    const days = [
                      "Dim",
                      "Lun",
                      "Mar",
                      "Mer",
                      "Jeu",
                      "Ven",
                      "Sam",
                    ];
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
                    const dayName = days[date.getDay()];
                    const dayNum = date.getDate();
                    const monthName = months[date.getMonth()];
                    const [hours, minutes] = session.start_time.split(":");
                    const timeStr = `${hours}h${minutes}`;
                    const isSelected = selectedSessionId === session.id;
                    const isFull =
                      session.current_participants >= session.max_participants;

                    return (
                      <div
                        key={session.id}
                        className={`flex items-center justify-between p-4 border-2 rounded-lg ${
                          isSelected
                            ? "border-blue-900 bg-blue-50"
                            : "border-gray-200"
                        } ${
                          isFull
                            ? "opacity-50"
                            : "cursor-pointer hover:border-gray-300"
                        }`}
                        onClick={() =>
                          !isFull && setSelectedSessionId(session.id)
                        }
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {dayName}, {dayNum} {monthName} {timeStr}
                          </p>
                          {session.location && (
                            <p className="text-sm text-gray-600 mt-1">
                              📍 {session.location}
                            </p>
                          )}
                          {isFull && (
                            <p className="text-sm text-red-600 mt-1">
                              Complet ({session.current_participants}/
                              {session.max_participants})
                            </p>
                          )}
                        </div>
                        <button
                          className={`px-4 py-2 rounded-lg font-medium ${
                            isSelected
                              ? "bg-blue-900 text-white"
                              : isFull
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                          disabled={isFull}
                        >
                          {isFull
                            ? "Complet"
                            : isSelected
                            ? "Sélectionné"
                            : "Réserver"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-600 py-10">
              🧩 Cours similaires - Fonctionnalité à venir
            </div>
          )}
        </div>

        {/* --- Action Button (Book or Edit) --- */}
        {!isOwner && (
          <div className="mt-6">
            <button
              onClick={handleBookCourse}
              disabled={!selectedSessionId}
              className={`w-full py-3 rounded-full font-semibold transition-all ${
                selectedSessionId
                  ? "bg-blue-900 text-white hover:bg-blue-800"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {selectedSessionId
                ? "Réserver ce cours"
                : "Sélectionnez une date pour réserver"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
