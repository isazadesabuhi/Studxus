"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import CardCarousel from "@/components/CardRecommandation";
import type { User } from "@supabase/supabase-js";
import mascotte_v1 from "@/public/mascotte_v1.png";

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
  // add more…
];

interface UserProfile {
  id: string;
  email: string;
  name: string;
  surname: string;
  user_type: "Professeur" | "Etudiant";
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  postal_code?: string;
  created_at: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user) {
        router.push("/");
        return;
      }

      setUser(userData.user);

      // Try to fetch profile from API
      try {
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
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    load();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen max-w-[450px]">
      <div className="flex flex-col justify-center py-4 px-4">
        {profile && (
          <>
            <div className="flex flex-row">
              <Image
                src={mascotte_v1}
                width={160}
                height={180}
                alt="mascotte_v1"
              />

              <div className="relative w-[203px] h-[101px] flex items-center justify-center">
                {/* SVG background */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="203"
                  height="101"
                  viewBox="0 0 203 101"
                  fill="none"
                  className="absolute inset-0"
                >
                  <mask id="path-1-inside-1_2147_3118" fill="white">
                    <path d="M187 0C195.836 0 203 7.16344 203 16V79.8145C203 88.651 195.836 95.8145 187 95.8145H34.5701L3.10284 99.9968C1.51483 100.208 0.335531 98.5595 1.04803 97.1247L9.53916 80.0257C9.67643 79.7493 9.74786 79.4449 9.74786 79.1362V16C9.74786 7.16344 16.9113 0 25.7479 0H187Z" />
                  </mask>
                  <path
                    d="M34.5701 95.8145V93.8145H34.4378L34.3066 93.8319L34.5701 95.8145ZM9.53916 80.0257L11.3305 80.9153L9.53916 80.0257ZM3.10284 99.9968L2.83933 98.0143L3.10284 99.9968ZM1.04803 97.1247L2.83933 98.0143L1.04803 97.1247ZM187 0V2C194.732 2 201 8.26801 201 16H203H205C205 6.05887 196.941 -2 187 -2V0ZM203 16H201V79.8145H203H205V16H203ZM203 79.8145H201C201 87.5464 194.732 93.8145 187 93.8145V95.8145V97.8145C196.941 97.8145 205 89.7556 205 79.8145H203ZM187 95.8145V93.8145H34.5701V95.8145V97.8145H187V95.8145ZM34.5701 95.8145L34.3066 93.8319L2.83933 98.0143L3.10284 99.9968L3.36634 101.979L34.8336 97.797L34.5701 95.8145ZM1.04803 97.1247L2.83933 98.0143L11.3305 80.9153L9.53916 80.0257L7.74786 79.1362L-0.743261 96.2352L1.04803 97.1247ZM9.74786 79.1362H11.7479V16H9.74786H7.74786V79.1362H9.74786ZM9.74786 16H11.7479C11.7479 8.26801 18.0159 2 25.7479 2V0V-2C15.8067 -2 7.74786 6.05887 7.74786 16H9.74786ZM25.7479 0V2H187V0V-2H25.7479V0ZM9.53916 80.0257L11.3305 80.9153C11.605 80.3624 11.7479 79.7535 11.7479 79.1362H9.74786H7.74786L9.53916 80.0257ZM3.10284 99.9968L2.83933 98.0143L2.83933 98.0143L1.04803 97.1247L-0.743261 96.2352C-2.16827 99.1048 0.190345 102.402 3.36634 101.979L3.10284 99.9968Z"
                    fill="#FAB818"
                    mask="url(#path-1-inside-1_2147_3118)"
                  />
                </svg>

                {/* Two lines of centered text */}
                <div className="absolute flex flex-col items-center justify-center text-center text-[#1A3A60] px-[10px]">
                  <span className="text-base leading-tight">
                    Bonjour {profile.name}{" "}
                  </span>
                  <span className="text-sm leading-tight">
                    Prêt à apprendre et partager ?
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-end w-full mt-[-50px]">
              <div className="flex flex-col min-w-[25%]">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="given-name"
                  required
                  className="mt-2 block rounded-[100px] border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Chercher un cours"
                />
                <button className="mt-2 block rounded-[100px] border border-gray-300 px-4 py-3 text-[#FAB818] placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-[#1A3A60]">
                  Proposer un cours
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <Link
        href="/"
        className="border-b-1 text-[#1A3A60] font-semibold
"
      >
        Tes prochains cours
      </Link>
      {/* Cours */}
      <p className="text-center text-[#1A3A60] pt-5">
        Tu n’as pas encore réservé de cours
      </p>
      <div className="pt-5">
        <CardCarousel items={demo} />
      </div>
    </div>
  );
}
