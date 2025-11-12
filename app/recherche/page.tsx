"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CourseCard, { type Course } from "@/components/CourseCard";

import Map, { Marker, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import React from "react";

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
  coordinates: [number, number];
  author: {
    id: string;
    name: string;
    surname: string;
    fullName: string;
    email: string;
    userType: string;
  } | null;
}

export default function SearchPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<APICourse[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<APICourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  // Fetch all courses on mount
  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        setLoading(true);
        setError(null);

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
        // Attendre toutes les promesses retournées par map()
        const courses = await Promise.all(
          data.courses.map(async (course: APICourse) => {
            const c = await fetchSessions(course);
            return c;
          })
        );
        console.log("Fetched courses with sessions:", courses);
        setCourses(courses || []);
        setFilteredCourses(courses || []);
      } catch (err: any) {
        console.error("Error fetching courses:", err);
        setError(err.message || "Une erreur s'est produite");
      } finally {
        setLoading(false);
      }
    };

    fetchAllCourses();
  }, []);



  const fetchSessions = async (course: APICourse) => {
    if (!course) return;

    try {
      const response = await fetch(`/api/courses/${course.id}/sessions`);
      if (!response.ok) throw new Error("Erreur lors du fetch des sessions");

      const data = await response.json();

      // ✅ On récupère la première session
      const session = data.sessions?.[0];

      if (session?.location) {
        // 🗺️ On géocode l'adresse pour obtenir les coordonnées
        const geoRes = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            session.location
          )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
        );

        const geoData = await geoRes.json();

        if (geoData?.features?.[0]?.center) {
          const [lon, lat] = geoData.features[0].center;
          course.coordinates = [lon, lat];
        } else {
          console.warn("Aucune coordonnée trouvée pour :", session.location);
          // fallback sur un point par défaut
          course.coordinates = [4.83207, 45.75770];
        }
      } else {
        // Pas d'adresse connue
        course.coordinates = [4.83207, 45.75770];
      }

      return course;
    } catch (err) {
      console.error("Error fetching sessions:", err);
      return null;
    }
  };

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

    setFilteredCourses(filtered);
  }, [searchQuery, selectedCategory, selectedLevel, courses]);

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

  // Transform API data to CourseCard format
  const transformToCourseCard = (apiCourse: APICourse): Course => {
    return {
      id: apiCourse.id,
      title: apiCourse.title,
      teacher: apiCourse.author?.fullName || "Enseignant",
      schedule: apiCourse.shortDescription || apiCourse.description,
      wednesday: `Par ${apiCourse.author?.fullName || "Anonyme"}`,
      level: apiCourse.level,
      price: `${apiCourse.pricePerHour}€/h`,
      image: "/vba.jpg", // Default image
    };
  };

  const [viewport, setViewport] = React.useState({
    longitude: 4.8357,
    latitude: 45.7640,
    zoom: 13,
  });

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
    <div className="flex flex-col justify-center px-4 pb-20  bg-gray-50">
      {/* Search Bar */}
      <div className="mb-4">
        <input
          id="search"
          name="search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher un cours..."
          className="w-full placeholder:text-sm  mt-2 block rounded-[100px] border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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

      <div className="relative w-full h-[40vh] rounded-xl overflow-hidden">
        <Map
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          initialViewState={viewport}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          style={{ width: "100%", height: "100%" }}
        >
          <NavigationControl position="bottom-right" />

          {courses.map((course) => (
            <Marker
              key={course.id}
              longitude={course.coordinates[0]}
              latitude={course.coordinates[1]}
            >
              <div 
              onClick={() => handleDetails(course.id)}
              className="flex flex-col items-center">
                <img
                  src="/marker-map.png"
                  alt={course.title}
                  className="w-8 h-8"
                />
                <span className="bg-slate-900 text-white text-xs font-semibold px-2 py-1 rounded-full mt-1 shadow">
                  {course.pricePerHour} €
                </span>
              </div>
            </Marker>
          ))}
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
              />
              {/* Additional info badge */}
              <div className="mt-2 flex items-center justify-between px-4">
                <span className="text-xs text-gray-500">{course.category}</span>
                <span className="text-xs text-gray-500">
                  Max: {course.maxParticipants} participants
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
