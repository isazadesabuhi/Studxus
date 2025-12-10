"use client";

import CardCarousel from "@/components/CardRecommandation";
import Heading from "@/components/Heading";
import { supabase } from "@/lib/supabase";
import mascotte_v1 from "@/public/mascotte_v1.png";
import vba from "@/public/vba.jpg";
import vague from "@/public/wave2.png";
import { BarChart3, BookOpen, ChevronRight, Clock, MapPin } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { RefObject, useEffect, useRef, useState } from "react";
import { UserProfile } from "../types/UserProfile";

const demo = [
  {
    id: "1",
    title: "Marketing digital",
    subtitle: "Boostez vos ventes grâce au digital",
    level: "Intermédiaire",
    days: "Lun, Mer, Jeu, Ven",
    time: "09h30 - 10h30",
    price: "15€",
    teacherName: "Jade",
    rating: 4.9,
    distanceKm: 1.5,
    popular: true,
  },
  {
    id: "2",
    title: "UX Design",
    subtitle: "Créer des interfaces qui convertissent",
    level: "Débutant",
    days: "Mar, Jeu",
    time: "18h00 - 19h30",
    price: "29€",
    teacherName: "Alex",
    rating: 4.8,
    distanceKm: 2.3,
  },
  {
    id: "2",
    title: "UX Design",
    subtitle: "Créer des interfaces qui convertissent",
    level: "Débutant",
    days: "Mar, Jeu",
    time: "18h00 - 19h30",
    price: "29€",
    teacherName: "Alex",
    rating: 4.8,
    distanceKm: 2.3,
  },
  {
    id: "2",
    title: "UX Design",
    subtitle: "Créer des interfaces qui convertissent",
    level: "Débutant",
    days: "Mar, Jeu",
    time: "18h00 - 19h30",
    price: "29€",
    teacherName: "Alex",
    rating: 4.8,
    distanceKm: 2.3,
  },
];

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
  } | null;
  session: {
    sessionDate: string;
    startTime: string;
    endTime: string;
    location: string | null;
  } | null;
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<string[]>([]);
  // const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const router = useRouter();


  const scrollerCatRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: userData } = await supabase.auth.getUser();

        if (!userData?.user) {
          router.push("/");
          return;
        }

        // Try to fetch profile from API
        const { data: session } = await supabase.auth.getSession();
        if (session.session) {
          const profileRes = await fetch("/api/profiles", {
            headers: {
              Authorization: `Bearer ${session.session.access_token}`,
            },
          });

          if (profileRes.ok) {
            const profileData = await profileRes.json();
            setProfile(profileData);
          } else {
            throw new Error("Impossible de charger le profil");
          }

          // Fetch bookings
          const bookingsResponse = await fetch("/api/bookings", {
            headers: {
              Authorization: `Bearer ${session.session.access_token}`,
            },
          });
          if (bookingsResponse.ok) {
            const bookingsData = await bookingsResponse.json();
            // Filter only active bookings
            const activeBookings = (bookingsData.bookings || []).filter(
              (b: Booking) =>
                b.status !== "cancelled" && b.status !== "completed"
            );
            setBookings(activeBookings);
          }
        }
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError(err.message || "Une erreur s'est produite");
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      // setCategoriesLoading(true);
      try {
        const response = await fetch("/api/users/interests", {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await response.json();
        const availableCategories = data?.available_interests || [];
        setCategories(availableCategories);
        console.log("Fetched categories:", availableCategories);


      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Impossible de charger les catégories");
      } finally {
        // setCategoriesLoading(false);
      }
    };

    fetchCategories();

    load();
  }, [router]);


    const normalizeInterestName = (name: string):string  => {
    return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accents
      .toLowerCase();
  }
  const handleClick = () => {
    router.push("/recherche");
  };

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
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]
      }`;
  };

  const formatTime = (timeString: string) => {
    const [h, m] = timeString.split(":");
    return `${h}h${m}`;
  };

  const scrollBy = (dir: "left" | "right",scroller:RefObject<HTMLDivElement | null>) => {
    const el = scroller.current;
    if (!el) return;
    const amount = el.clientWidth * 0.9;
    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen max-w-[450px] bg-gray-50 flex flex-col justify-center items-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
        <p className="mt-4 text-gray-600">Chargement de votre profil...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen max-w-[450px] bg-gray-50 flex flex-col justify-center p-4">
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

  // No profile state
  if (!profile) {
    return (
      <div className="min-h-screen max-w-[450px] bg-gray-50 flex flex-col justify-center p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-[450px] bg-gray-50">
      <div className="flex flex-col justify-center py-4 px-4">
        <Heading as="h2" className="text-2xl text-primary font-semibold">
          Bonjour {profile.name}{" "}
        </Heading>

        <div className="relative w-full overflow-x-auto no-scrollbar snap-x snap-mandatory px-1">
          <div
            ref={scrollRef}
            className="flex flex-row gap-4 w-max scroll-smooth"
          >
            <div className="flex w-70  relative flex-col items-center justify-center rounded-2xl  px-4 py-6 text-center shadow-sm bg-white">
              <div className="absolute z-0 top-0 left-0  w-50 h-full">
                <Image
                  src={vague}
                  alt="Décor vague"
                  fill
                  className="object-cover rounded-2xl opacity-70"
                />
              </div>
              <div className="flex flex-row w-full space-x-0 z-10">
                <Image src={mascotte_v1} width={80} alt="mascotte_v1" />

                {/* SVG background */}

                {/* Two lines of centered text */}
                <div className=" flex flex-col  gap-2 items-center h-full justify-center text-center text-primary px-[10px]">
                  <span className="text-sm leading-tight">
                    Prêt à apprendre et partager ?
                  </span>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="given-name"
                    required
                    className="mt-2 block w-full
        rounded-[100px] border
        border-gray-300 px-3 py-2
        placeholder:text-xs 
        text-gray-900 placeholder-gray-400
        focus:border-primary focus:ring-primary sm:text-xs"
                    placeholder="Chercher un cours"
                    onClick={handleClick} // 👈 redirect on click
                  />
                </div>
              </div>
            </div>

            <div className="flex w-70 relative flex-col items-center justify-center rounded-2xl  px-4 py-6 text-center shadow-sm bg-white">
              <div className="absolute z-0 top-0 left-0  w-50 h-full">
                <Image
                  src={vague}
                  alt="Décor vague"
                  fill
                  className="object-cover rounded-2xl opacity-70"
                />
              </div>
              <div className="flex flex-row w-full space-x-0 z-10">
                <Image src={mascotte_v1} width={80} alt="mascotte_v1" />

                {/* SVG background */}

                {/* Two lines of centered text */}

                <div className=" flex flex-col gap-2 items-center h-full justify-center text-center text-primary px-[10px]">
                  <span className="text-sm leading-tight">
                    Prêt à partager et apprendre ?
                  </span>

                  <button
                    onClick={() => router.push("/cours/enseignes")}
                    className="inline-flex items-center gap-1  rounded-full border-primary border-2 bg-white px-2 py-2 text-xs font-bold text-primary hover:bg-blue-800"
                  >
                    <BookOpen className="w-4 h-4" />
                    Proposer un cours
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>




        <div className="flex items-center justify-between mb-3 mt-5">
          <Heading as="h4" underlined={true}>
            Catégories
          </Heading>
          {bookings.length > 0 && (
            <div className="none flex gap-2">
              <button
                onClick={() => scrollBy("left",scrollerCatRef)}
                className="rounded-full border px-3 py-2 text-sm hover:bg-gray-50"
                aria-label="Précédent"
              >
                ←
              </button>
              <button
                onClick={() => scrollBy("right",scrollerCatRef)}
                className="rounded-full border px-3 py-2 text-sm hover:bg-gray-50"
                aria-label="Suivant"
              >
                →
              </button>
            </div>


          )}


        </div>

        {/* Reserved Courses */}
        {categories.length === 0 ? (
          <p className="text-center text-primary pt-5">
            Tu n'as pas encore réservé de cours
          </p>
        ) : (
          <div
            ref={scrollerCatRef}
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
          >
            {categories.map((category) => (
              <div
                key={category}
                className="snap-start shrink-0 w-[120px]"
                onClick={() =>
                  router.push(`/recherche/?category=${category}`)
                }
              >
                <div className="bg-blue-50 rounded-lg p-4 cursor-pointer hover:bg-blue-100 transition-all h-full">

                  <div className="flex flex-col  justify-center items-center gap-3">
                    <Image
                      src={`/interests/${normalizeInterestName(category || "")}.png`}
                      alt={category || "Course Image"}
                      width={40}
                      height={40}
                    />
                    <div className="flex-1">
                      <p  className="font-medium text-sm  mb-1">
                        {category || "Cours (chargement...)"}
                      </p>
                      
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}


        <div className="flex items-center justify-between mb-3 mt-5">
          <Heading as="h4" underlined={true}>
            Tes prochains cours
          </Heading>
          {bookings.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => scrollBy("left",scrollerRef)}
                className="rounded-full border px-3 py-2 text-sm hover:bg-gray-50"
                aria-label="Précédent"
              >
                ←
              </button>
              <button
                onClick={() => scrollBy("right",scrollerRef)}
                className="rounded-full border px-3 py-2 text-sm hover:bg-gray-50"
                aria-label="Suivant"
              >
                →
              </button>
            </div>


          )}


        </div>

        {/* Reserved Courses */}
        {bookings.length === 0 ? (
          <p className="text-center text-primary pt-5">
            Tu n'as pas encore réservé de cours
          </p>
        ) : (
          <div
            ref={scrollerRef}
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
          >
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="snap-start shrink-0 w-[280px]"
                onClick={() =>
                  booking.courseId &&
                  router.push(`/cours/detail/${booking.courseId}`)
                }
              >
                <div className="bg-blue-50 rounded-lg p-4 cursor-pointer hover:bg-blue-100 transition-all h-full">
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
              </div>
            ))}
          </div>
        )}

        {/* Recommendations */}
        <div className="pt-5">
          <CardCarousel items={demo} />
        </div>
      </div>
    </div>
  );
}
