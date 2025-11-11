"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import CardCarousel from "@/components/CardRecommandation";
import mascotte_v1 from "@/public/mascotte_v1.png";
import vague from "@/public/wave2.png";
import Heading from "@/components/Heading";
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

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
        }
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError(err.message || "Une erreur s'est produite");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  const handleClick = () => {
    router.push("/recherche");
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
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          {/* <p className="text-yellow-800 mb-2">Profil introuvable</p>
          <button
            onClick={() => router.push("/")}
            className="text-sm text-yellow-700 underline"
          >
            Retour à l'accueil
          </button> */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-[450px] bg-gray-50">
      <div className="flex flex-col justify-center py-4 px-4">
        <Heading as="h2" className="text-2xl text-primary font-semibold">
          Bonjour {profile.name}{" "}
        </Heading>

        <div className="flex relative flex-col items-center justify-center rounded-2xl  px-4 py-6 text-center shadow-sm bg-white">
          <div className="absolute z-0 top-0 left-0  w-50 h-full">
            <Image
              src={vague}
              alt="Décor vague"
              fill
              className="object-cover rounded-2xl opacity-70"
            />
          </div>
          <div className="flex flex-row w-full space-x-0 z-10">
            <Image src={mascotte_v1} width={90} alt="mascotte_v1" />

            {/* SVG background */}

            {/* Two lines of centered text */}
            <div className=" flex flex-col items-center h-full justify-center text-center text-primary px-[10px]">
              <span className="text-sm leading-tight">
                Prêt à apprendre et partager ?
              </span>

              <input
                id="name"
                name="name"
                type="text"
                autoComplete="given-name"
                required
                className="mt-2 block 
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

        <Link href="/">
          <Heading as="h4" underlined={true}>
            Tes prochains cours
          </Heading>
        </Link>
        {/* Cours */}
        <p className="text-center text-primary pt-5">
          Tu n'as pas encore réservé de cours
        </p>
        <div className="pt-5">
          <CardCarousel items={demo} />
        </div>
      </div>
    </div>
  );
}
