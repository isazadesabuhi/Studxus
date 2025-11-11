"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CourseCard, { type Course } from "@/components/CourseCard";

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
  }, []);

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
  console.log(courses);

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
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
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
