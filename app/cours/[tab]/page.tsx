"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import CourseCard, { type Course } from "@/components/CourseCard";
import Image from "next/image";

type TabKey = "reserves" | "enseignes";

interface APICourse {
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
    author: { fullName: string } | null;
    category: string;
  } | null;
  session: {
    sessionDate: string;
    startTime: string;
    endTime: string;
    location: string | null;
    category: string;
  } | null;
  userId: string;
  title: string;
  description: string;
  category: string;
  level: string;
  pricePerHour: number;
  maxParticipants: number;
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

function MyCoursesContent({ activeTab }: { activeTab: TabKey }) {
  const router = useRouter();
  const [courses, setCourses] = useState<APICourse[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.push("/");
          return;
        }

        // Fetch courses
        const coursesResponse = await fetch(`/api/courses?userId=${user.id}`);
        if (!coursesResponse.ok)
          throw new Error("Échec du chargement des cours");
        const coursesData = await coursesResponse.json();
        setCourses(coursesData.courses || []);

        // Fetch bookings
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          const bookingsResponse = await fetch("/api/bookings", {
            headers: {
              Authorization: `Bearer ${sessionData.session.access_token}`,
            },
          });
          if (bookingsResponse.ok) {
            const bookingsData = await bookingsResponse.json();
            setBookings(bookingsData.bookings || []);
          }
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Erreur");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const handleDetails = (id: string) => router.push(`/cours/detail/${id}`);
  const handleEdit = (id: string) => console.log("Edit course:", id);

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce cours ?")) return;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("Session expirée");
      const res = await fetch(`/api/courses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });
      if (!res.ok) throw new Error("Échec de la suppression");
      setCourses((prev) => prev.filter((c) => c.id !== id));
      alert("Cours supprimé");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const transformToCourseCard = (apiCourse: APICourse): Course => ({
    id: apiCourse.id,
    title: apiCourse.title,
    schedule: `Prix: ${apiCourse.pricePerHour}€/h`,
    wednesday: `Max participants: ${apiCourse.maxParticipants}`,
    level: apiCourse.level,
    price: `${apiCourse.pricePerHour}€/h`,
    image: "/vba.jpg",
  });

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
    const [h, m] = timeString.split(":");
    return `${h}h${m}`;
  };

  const reservedBookings = bookings.filter(
    (b) => b && b.status && b.status !== "cancelled" && b.status !== "completed"
  );

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin inline-block h-8 w-8 border-b-2 border-gray-900 rounded-full"></div>
        <p className="mt-4 text-gray-600">Chargement de vos cours...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }
  console.log(courses);
  console.log(reservedBookings);

  return (
    <div className="p-4">
      {activeTab === "reserves" ? (
        reservedBookings.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600 mb-4">
              Vous n'avez pas encore de réservations
            </p>
            <button
              onClick={() => router.push("/recherche")}
              className="rounded-full bg-blue-900 px-6 py-3 text-sm font-bold text-white hover:bg-blue-800"
            >
              Rechercher des cours
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* {reservedBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-blue-50 rounded-lg p-4 cursor-pointer hover:bg-blue-100 transition-all"
                onClick={() =>
                  booking.courseId &&
                  router.push(`/cours/detail/${booking.courseId}`)
                }
              >
                {booking.session && (
                  <p className="font-semibold text-blue-900 mb-1">
                    {formatDate(booking.session.sessionDate)}
                  </p>
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
                    <div className="text-sm text-gray-700 space-y-1">
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
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))} */}
            {reservedBookings.map((course) => (
              <div key={course.id}>
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
            className="rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-amber-400 hover:bg-slate-800"
          >
            Créer mon premier cours
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {courses.map((course) => (
            <div key={course.id}>
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

      {activeTab === "enseignes" && courses.length > 0 && (
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
    </div>
  );
}

function MyCoursesLoading() {
  return (
    <div className="p-4 text-center">
      <div className="animate-spin inline-block h-8 w-8 border-b-2 border-gray-900 rounded-full"></div>
      <p className="mt-4 text-gray-600">Chargement...</p>
    </div>
  );
}

export default function MyCoursesPage({ params }: { params: { tab: string } }) {
  const tab = (params.tab === "enseignes" ? "enseignes" : "reserves") as TabKey;
  return (
    <Suspense fallback={<MyCoursesLoading />}>
      <MyCoursesContent activeTab={tab} />
    </Suspense>
  );
}
