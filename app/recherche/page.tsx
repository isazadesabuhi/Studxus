"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CourseCard, { type Course } from "@/components/CourseCard";

import Map, { Marker, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import React from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

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
  sessions: any;
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

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";

  const router = useRouter();
  const [courses, setCourses] = useState<APICourse[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<APICourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<string>(initialCategory);
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserLocation, setCurrentUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const pathname = usePathname(); // Récupère le chemin actuel (ex: "/contact")
  // Fetch current user
  useEffect(() => {
    if (initialCategory) {
      // On remplace l'URL par le chemin pur (pathname) sans les paramètres
      // { scroll: false } est important pour éviter que la page ne remonte tout en haut
      router.replace(pathname, { scroll: false });
    }
    const fetchCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
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
      }
    };
    fetchCurrentUser();
  }, [initialCategory, pathname, router]);

  // Fetch all courses on mount
  useEffect(() => {
    const fetchAllCourses = async () => {
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

        // Fetch all courses (no userId filter)
        const response = await fetch("/api/courses", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Échec du chargement des cours");
        }

        const data = await response.json();
        setCourses(data.courses || []);
        setFilteredCourses(data.courses || []);
      } catch (err: any) {
        console.error("Error fetching courses:", err);
        setError(err.message || "Une erreur s'est produite");
      } finally {
        setLoading(false);
      }
    };

    fetchAllCourses();
  }, [router]);

  // Filter courses based on search query, category, and level
  useEffect(() => {
    let filtered = [...courses];

    // Filter by search query (title, description, category)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.description?.toLowerCase().includes(query) ||
          course.category?.toLowerCase().includes(query) ||
          course.author?.fullName.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (course) => course.category === selectedCategory
      );
    }

    // Filter by level
    if (selectedLevel !== "all") {
      filtered = filtered.filter((course) => course.level === selectedLevel);
    }

    // Exclude courses created by the currently logged-in user
    if (currentUserId) {
      filtered = filtered.filter((course) => course.userId !== currentUserId);
    }

    setFilteredCourses(filtered);
  }, [searchQuery, selectedCategory, selectedLevel, courses, currentUserId]);

  // Get unique categories from courses
  const categories = Array.from(
    new Set(courses.map((c) => c.category).filter(Boolean))
  );

  // Available levels
  const levels = ["Débutant", "Intermédiaire", "Avancé"];

  const handleDetails = (id: string) => {
    router.push(`/cours/detail/${id}`);
  };

  const handleEdit = (id: string) => {
    console.log("Edit course:", id);
    // Only available for course owner
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

  // Transform API data to CourseCard format
  const transformToCourseCard = (apiCourse: APICourse): Course => {
    const distanceKm = calculateDistanceKm(
      currentUserLocation,
      apiCourse.author?.latitude ?? apiCourse.latitude ?? null,
      apiCourse.author?.longitude ?? apiCourse.longitude ?? null
    );
    const firstSessionInfo = buildFirstSessionInfo(apiCourse.sessions);

    return {
      id: apiCourse.id,
      title: apiCourse.title,
      teacher: apiCourse.author?.fullName || "Enseignant",
      schedule: apiCourse.description,
      wednesday: `Par ${apiCourse.author?.fullName || "Anonyme"}`,
      level: apiCourse.level,
      price: `${apiCourse.pricePerHour}€/h`,
      image: "/vba.jpg", // Default image
      userId: apiCourse.userId, // Pass the course owner ID
      sessions: apiCourse.sessions,
      distance: distanceKm ?? 0,
      category: apiCourse.category,
      timeSlot: firstSessionInfo.label,
      availablePlaces: firstSessionInfo.availablePlaces,
    };
  };

  // Calculate map center based on courses with valid coordinates
  const calculateMapCenter = useCallback(() => {
    const coursesWithCoordinates = filteredCourses.filter(
      (course) =>
        (course.author?.latitude != null && course.author?.longitude != null) ||
        (course.latitude != null && course.longitude != null)
    );

    if (coursesWithCoordinates.length === 0) {
      // Default to Lyon
      return { longitude: 4.8617641, latitude: 45.7539477, zoom: 10 };
    }

    // Calculate average position
    const avgLat =
      coursesWithCoordinates.reduce(
        (sum, course) =>
          sum +
          (course.author?.latitude ?? course.latitude ?? 0),
        0
      ) / coursesWithCoordinates.length;
    const avgLng =
      coursesWithCoordinates.reduce(
        (sum, course) =>
          sum +
          (course.author?.longitude ?? course.longitude ?? 0),
        0
      ) / coursesWithCoordinates.length;

    return { longitude: avgLng, latitude: avgLat, zoom: 12 };
  }, [filteredCourses]);

  const [viewport, setViewport] = React.useState(calculateMapCenter());

  // Update viewport when filtered courses change
  useEffect(() => {
    setViewport(calculateMapCenter());
  }, [filteredCourses, calculateMapCenter]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px]">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
        <p className="mt-4 text-gray-600">Chargement des cours...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-red-700 underline"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center px-4 pb-20 bg-gray-50">
      {/* Search Bar */}
      <div className="mb-4">
        <input
          id="search"
          name="search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher un cours..."
          className="w-full placeholder:text-sm mt-2 block rounded-[100px] border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-row gap-3">
        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="flex-1 rounded-lg border text-primary border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
        >
          <option value="all">Toutes les catégories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        {/* Level Filter */}
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="flex-1 rounded-lg border text-primary border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
        >
          <option value="all">Tous les niveaux</option>
          {levels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      {/* Map with professor locations */}
      <div className="relative w-full h-[40vh] rounded-xl overflow-hidden mb-4">
        <Map
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          initialViewState={viewport}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          style={{ width: "100%", height: "100%" }}
        >
          <NavigationControl position="bottom-right" />

          {filteredCourses.map((course) => {
            const lat = course.author?.latitude ?? course.latitude;
            const lng = course.author?.longitude ?? course.longitude;
            // Only show marker if we have valid coordinates
            if (!lat || !lng) {
              return null;
            }

            return (
              <Marker
                key={course.id}
                longitude={lng}
                latitude={lat}
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  router.push(`/cours/detail/${course.id}`);
                }}
              >
                <div className="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform">
                  <Image
                    src="/marker-map.png"
                    alt={course.title}
                    width={32}
                    height={32}
                    className="w-8 h-8"
                  />
                  <span className="bg-slate-900 text-white text-xs font-semibold px-2 py-1 rounded-full mt-1 shadow whitespace-nowrap">
                    {course.pricePerHour} €
                  </span>
                </div>
              </Marker>
            );
          })}
        </Map>
      </div>

      {/* Results Count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredCourses.length} cours trouvé
          {filteredCourses.length > 1 ? "s" : ""}
        </p>
        {(searchQuery ||
          selectedCategory !== "all" ||
          selectedLevel !== "all") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setSelectedLevel("all");
            }}
            className="text-sm text-blue-900 underline"
          >
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* Course Cards */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600 mb-4">
            Aucun cours ne correspond à votre recherche
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setSelectedLevel("all");
            }}
            className="text-sm text-blue-900 underline"
          >
            Voir tous les cours
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredCourses.map((course) => (
            <div key={course.id}>
              <CourseCard
                course={transformToCourseCard(course)}
                onDetails={handleDetails}
                onEdit={handleEdit}
                currentUserId={currentUserId || undefined}
              />
              {/* Additional info badge */}
              {/* <div className="mt-2 flex items-center justify-between px-4">
                <span className="text-xs text-gray-500">{course.category}</span>
                <span className="text-xs text-gray-500">
                  Max: {course.maxParticipants} participants
                </span>
              </div> */}
              {/* Show professor location info if available */}
              {/* {(course.author?.latitude ?? course.latitude) &&
              (course.author?.longitude ?? course.longitude) ? (
                <div className="mt-1 px-4">
                  <span className="text-xs text-gray-400">
                    📍 Professeur localisé
                  </span>
                </div>
              ) : null} */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
