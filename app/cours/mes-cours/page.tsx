"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import CourseCard, { type Course } from "@/components/CourseCard";
import Image from "next/image";
import vba from "@/public/vba.jpg";
import { MapPin, BarChart3, Clock, ChevronRight } from "lucide-react";

type TabKey = "reserved" | "programmed";

interface APICourse {
  id: string;
  userId: string;
  title: string;
  description: string;
  shortDescription: string;
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

interface Booking {
  id: string;
  courseId: string;
  courseSessionId: string;
  status: string;
  paymentStatus: string;
  amount: number;
  createdAt: string;
  paidAt: string | null;
  course: {
    id: string;
    title: string;
    level: string;
    author: {
      fullName: string;
    } | null;
  } | null;
  session: {
    sessionDate: string;
    startTime: string;
    endTime: string;
    location: string | null;
  } | null;
}

// Create a separate component that uses useSearchParams
function MyCoursesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabKey>(
    (searchParams.get("tab") as TabKey) || "reserved"
  );
  const [courses, setCourses] = useState<APICourse[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch user's courses and bookings on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.push("/");
          return;
        }

        setUserId(user.id);

        // Fetch courses filtered by current user's ID
        const coursesResponse = await fetch(`/api/courses?userId=${user.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!coursesResponse.ok) {
          throw new Error("Échec du chargement des cours");
        }

        const coursesData = await coursesResponse.json();
        setCourses(coursesData.courses || []);

        // Fetch bookings
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          const bookingsResponse = await fetch("/api/bookings", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${sessionData.session.access_token}`,
            },
          });

          if (bookingsResponse.ok) {
            const bookingsData = await bookingsResponse.json();
            console.log("Bookings fetched:", bookingsData.bookings);
            setBookings(bookingsData.bookings || []);
          } else {
            console.error(
              "Failed to fetch bookings:",
              await bookingsResponse.text()
            );
          }
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "Une erreur s'est produite");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleDetails = (id: string) => {
    router.push(`/cours/detail/${id}`);
  };

  const handleEdit = (id: string) => {
    console.log("Edit course:", id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce cours ?")) {
      return;
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        throw new Error("Session expirée");
      }

      const response = await fetch(`/api/courses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Échec de la suppression");
      }

      setCourses(courses.filter((c) => c.id !== id));
      alert("Cours supprimé avec succès");
    } catch (err: any) {
      alert(err.message || "Erreur lors de la suppression");
    }
  };

  const transformToCourseCard = (apiCourse: APICourse): Course => {
    return {
      id: apiCourse.id,
      title: apiCourse.title,
      schedule: `Prix: ${apiCourse.pricePerHour}€/h`,
      wednesday: `Max participants: ${apiCourse.maxParticipants}`,
      level: apiCourse.level,
      price: `${apiCourse.pricePerHour}€/h`,
      image: "/vba.jpg",
    };
  };

  if (loading) {
    return (
      <main className="relative mx-auto max-w-[450px] p-4">
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Chargement de vos cours...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="relative mx-auto max-w-[450px] p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-red-700 underline"
          >
            Réessayer
          </button>
        </div>
      </main>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = [
      "Dimanche",
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
    ];
    const months = [
      "janvier",
      "février",
      "mars",
      "avril",
      "mai",
      "juin",
      "juillet",
      "août",
      "septembre",
      "octobre",
      "novembre",
      "décembre",
    ];
    return `${days[date.getDay()]} ${date.getDate()} ${
      months[date.getMonth()]
    }`;
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    return `${hours}h${minutes}`;
  };

  const reservedBookings = bookings.filter(
    (b) => b && b.status && b.status !== "cancelled" && b.status !== "completed"
  );

  console.log("All bookings:", bookings);
  console.log("Filtered reserved bookings:", reservedBookings);

  return (
    <main className="relative mx-auto max-w-[450px]">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-blue-900">Mes Cours</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("reserved")}
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === "reserved"
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
          }`}
        >
          Réservés
        </button>
        <button
          onClick={() => setActiveTab("programmed")}
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === "programmed"
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
          }`}
        >
          Enseignés
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === "reserved" ? (
          reservedBookings.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600 mb-4">
                Vous n'avez pas encore de réservations
              </p>
              <button
                onClick={() => router.push("/recherche")}
                className="inline-flex items-center justify-center rounded-full bg-blue-900 px-6 py-3 text-sm font-bold text-white hover:bg-blue-800"
              >
                Rechercher des cours
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {reservedBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-blue-50 rounded-lg p-4 cursor-pointer hover:bg-blue-100 transition-all"
                  onClick={() => {
                    if (booking.courseId) {
                      router.push(`/cours/detail/${booking.courseId}`);
                    }
                  }}
                >
                  {booking.session && (
                    <div className="mb-2">
                      <p className="font-semibold text-blue-900">
                        {formatDate(booking.session.sessionDate)}
                      </p>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <Image
                      src={vba}
                      alt={booking.course?.title || "Course"}
                      width={60}
                      height={60}
                      className="rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {booking.course?.title || "Cours (chargement...)"}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-700">
                        {booking.course?.level && (
                          <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            <span>{booking.course.level}</span>
                          </div>
                        )}
                        {booking.session && (
                          <>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>
                                {formatTime(booking.session.startTime)} -{" "}
                                {formatTime(booking.session.endTime)}
                              </span>
                            </div>
                            {booking.session.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span className="text-xs">
                                  {booking.session.location}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">
                            Statut:{" "}
                            {booking.status === "paid"
                              ? "Payé"
                              : booking.status === "pending"
                              ? "En attente"
                              : booking.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )
        ) : courses.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600 mb-4">
              Vous n'avez pas encore créé de cours
            </p>
            <button
              onClick={() => router.push("/cours/creer-cours")}
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-amber-400 hover:bg-slate-800"
            >
              Créer mon premier cours
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {courses.map((course) => (
              <div key={course.id} className="relative">
                <CourseCard
                  course={transformToCourseCard(course)}
                  onDetails={handleDetails}
                  onEdit={handleEdit}
                />

                <div className="mt-2 px-4 py-2 bg-gray-50 rounded-lg text-sm">
                  <p className="text-gray-700">
                    <span className="font-semibold">Catégorie:</span>{" "}
                    {course.category}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Créé le:</span>{" "}
                    {new Date(course.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(course.id)}
                  className="mt-2 w-full text-red-600 text-sm py-2 border border-red-600 rounded-full hover:bg-red-50"
                >
                  Supprimer ce cours
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {activeTab === "programmed" && courses.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 mx-auto max-w-[450px]">
          <div className="pointer-events-none absolute inset-0 h-32 bg-gradient-to-t from-white via-white/90 to-transparent"></div>

          <div className="relative z-10 flex justify-center align-middle px-6 pb-4">
            <button
              onClick={() => router.push("/cours/creer-cours")}
              className="pointer-events-auto inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-amber-400 hover:bg-slate-800 sm:w-auto"
            >
              Créer un nouveau cours
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

// Loading fallback component
function MyCoursesLoading() {
  return (
    <main className="relative mx-auto max-w-[450px] p-4">
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-4 text-gray-600">Chargement...</p>
      </div>
    </main>
  );
}

// Main exported component wrapped in Suspense
export default function MyCoursesPage() {
  return (
    <Suspense fallback={<MyCoursesLoading />}>
      <MyCoursesContent />
    </Suspense>
  );
}
