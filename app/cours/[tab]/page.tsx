"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import CourseCard, { type Course } from "@/components/CourseCard";

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
  latitude?: number | null;
  longitude?: number | null;
  sessions?: any[];
  author: {
    id: string;
    name: string;
    surname: string;
    fullName: string;
    email: string;
    userType: string;
    latitude?: number;
    longitude?: number;
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
      latitude?: number | null;
      longitude?: number | null;
    } | null;
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
    latitude?: number;
    longitude?: number;
  } | null;
}

function MyCoursesContent({ activeTab }: { activeTab: TabKey }) {
  const router = useRouter();
  const [courses, setCourses] = useState<APICourse[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserLocation, setCurrentUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
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

        const latitude =
          typeof user.user_metadata?.latitude === "string"
            ? parseFloat(user.user_metadata.latitude)
            : user.user_metadata?.latitude;
        const longitude =
          typeof user.user_metadata?.longitude === "string"
            ? parseFloat(user.user_metadata.longitude)
            : user.user_metadata?.longitude;

        if (
          typeof latitude === "number" &&
          typeof longitude === "number" &&
          !Number.isNaN(latitude) &&
          !Number.isNaN(longitude)
        ) {
          setCurrentUserLocation({ latitude, longitude });
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

  const calculateDistanceKm = (
    userLocation: { latitude: number; longitude: number } | null,
    targetLat?: number | null,
    targetLng?: number | null
  ) => {
    if (
      !userLocation ||
      targetLat == null ||
      targetLng == null ||
      Number.isNaN(targetLat) ||
      Number.isNaN(targetLng)
    ) {
      return null;
    }

    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(targetLat - userLocation.latitude);
    const dLon = toRad(targetLng - userLocation.longitude);
    const lat1 = toRad(userLocation.latitude);
    const lat2 = toRad(targetLat);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const buildFirstSessionInfo = (
    sessions?: any[]
  ): { label: string; availablePlaces?: number } => {
    if (!Array.isArray(sessions) || sessions.length === 0) {
      return { label: "Horaire à définir", availablePlaces: undefined };
    }

    const normalizedSessions = sessions
      .map((session) => {
        const dateStr = session?.sessionDate || session?.session_date;
        const startStr = session?.startTime || session?.start_time;
        const endStr = session?.endTime || session?.end_time;
        const maxParticipants =
          session?.max_participants ?? session?.maxParticipants;
        const currentParticipants =
          session?.current_participants ?? session?.currentParticipants ?? 0;

        if (!dateStr || !startStr || !endStr) return null;

        const startDate = new Date(
          String(startStr).includes("T")
            ? startStr
            : `${dateStr}T${startStr}`
        );
        const endDate = new Date(
          String(endStr).includes("T") ? endStr : `${dateStr}T${endStr}`
        );

        if (
          Number.isNaN(startDate.getTime()) ||
          Number.isNaN(endDate.getTime())
        ) {
          return null;
        }

        return {
          dateStr,
          startDate,
          endDate,
          maxParticipants:
            typeof maxParticipants === "number" ? maxParticipants : undefined,
          currentParticipants:
            typeof currentParticipants === "number"
              ? currentParticipants
              : undefined,
        };
      })
      .filter(
        (
          value
        ): value is {
          dateStr: string;
          startDate: Date;
          endDate: Date;
          maxParticipants: number | undefined;
          currentParticipants: number | undefined;
        } => Boolean(value)
      )
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    const firstSession = normalizedSessions[0];
    if (!firstSession) {
      return { label: "Horaire à définir", availablePlaces: undefined };
    }

    const formatTime = (value: Date) => {
      const hours = value.getHours().toString().padStart(2, "0");
      const minutes = value.getMinutes().toString().padStart(2, "0");
      return `${hours}h${minutes}`;
    };

    const durationMinutes = Math.max(
      0,
      Math.round(
        (firstSession.endDate.getTime() - firstSession.startDate.getTime()) /
          60000
      )
    );
    const durationHours = Math.floor(durationMinutes / 60);
    const durationRemainder = durationMinutes % 60;
    const durationLabel = [
      durationHours ? `${durationHours}h` : "",
      durationRemainder ? `${durationRemainder}min` : "",
    ]
      .join("")
      .trim();

    const dateLabel = new Date(firstSession.dateStr).toLocaleDateString(
      "fr-FR",
      {
        day: "2-digit",
        month: "2-digit",
      }
    );

    const availablePlaces =
      typeof firstSession.maxParticipants === "number"
        ? Math.max(
            0,
            firstSession.maxParticipants -
              (firstSession.currentParticipants ?? 0)
          )
        : undefined;

    return {
      label: `${dateLabel} ${formatTime(firstSession.startDate)} - ${formatTime(
        firstSession.endDate
      )}${durationLabel ? ` (${durationLabel})` : ""}`,
      availablePlaces,
    };
  };

  const transformToCourseCard = (apiCourse: APICourse | Booking): Course => {
    const bookingCourse =
      "course" in apiCourse && apiCourse.course ? apiCourse.course : null;
    const courseData = bookingCourse ?? apiCourse;
    const pricePerHour =
      ("pricePerHour" in (courseData as any)
        ? (courseData as any).pricePerHour
        : undefined) ??
      ("pricePerHour" in apiCourse ? apiCourse.pricePerHour : undefined) ??
      0;
    const maxParticipants =
      ("maxParticipants" in apiCourse
        ? apiCourse.maxParticipants
        : undefined) ?? (bookingCourse as any)?.maxParticipants;
    const teacherName =
      courseData?.author?.fullName ??
      ("author" in apiCourse ? apiCourse.author?.fullName : undefined) ??
      "Enseignant";
    const courseId =
      ("id" in courseData ? courseData.id : undefined) ??
      ("courseId" in apiCourse ? apiCourse.courseId : undefined) ??
      apiCourse.id;
    const distanceKm = calculateDistanceKm(
      currentUserLocation,
      courseData?.author?.latitude ?? (courseData as any)?.latitude ?? null,
      courseData?.author?.longitude ?? (courseData as any)?.longitude ?? null
    );
    const sessionSource =
      "session" in apiCourse && (apiCourse as Booking).session
        ? [(apiCourse as Booking).session]
        : (courseData as any)?.sessions || (apiCourse as any).sessions;
    const firstSessionInfo = buildFirstSessionInfo(sessionSource);

    return {
      id: courseId,
      title: courseData?.title ?? apiCourse.title,
      schedule: `Prix: ${pricePerHour}€/h`,
      wednesday: maxParticipants
        ? `Max participants: ${maxParticipants}`
        : undefined,
      level: courseData?.level ?? apiCourse.level,
      price: `${pricePerHour}€/h`,
      image: "/vba.jpg",
      category: courseData?.category ?? apiCourse.category,
      teacher: teacherName,
      distance: distanceKm ?? 0,
      timeSlot: firstSessionInfo.label,
      availablePlaces: firstSessionInfo.availablePlaces,
    };
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
            {reservedBookings.map((course) => (
              <div key={course.id}>
                <CourseCard
                  course={transformToCourseCard(course)}
                  onDetails={handleDetails}
                  onEdit={handleEdit}
                />
                {/* <div className="mt-2 px-4 py-2 bg-gray-50 rounded-lg text-sm">
                  <p className="text-gray-700">
                    <span className="font-semibold">Catégorie:</span>{" "}
                    {course.category}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Créé le:</span>{" "}
                    {new Date(course.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div> */}
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
