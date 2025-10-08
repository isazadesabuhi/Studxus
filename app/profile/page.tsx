"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import MobileLayout from "../components/MobileLayout";
import { ArrowLeftIcon, ArrowsPointingOutIcon, CalendarIcon, FolderIcon, LockClosedIcon, PencilIcon, QuestionMarkCircleIcon, ShieldCheckIcon } from "@heroicons/react/16/solid";
import Image from "next/image";

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
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
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

      setLoading(false);
    };

    load();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <MobileLayout title="Profil">

        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-lg text-primary">Chargement...</div>
        </div>
      </MobileLayout>
    );
  }


  console.log(profile);
  console.log(user);
  return (

    <MobileLayout title="Compte">
      <div className="flex flex-col items-center p-4 pb-24">
        {/* Boutons retour et aide */}
        <div className="w-full flex justify-between items-center mb-2">
          <button onClick={() => router.back()}>
            <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex gap-3">
            <button>
              <ArrowsPointingOutIcon className="w-6 h-6 text-gray-700" />
            </button>
            <button>
              <QuestionMarkCircleIcon className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Avatar */}
        <div className="mt-2">
          <Image
            src="/placeholder-avatar.png"
            alt="Avatar"
            width={100}
            height={100}
            className="rounded-full border-2 border-gray-300"
          />
        </div>


        {/* Nom */}
        {profile && (
          <h2 className="text-lg text-primary font-bold mt-3">{profile.name}</h2>
        )}

        {/* Bouton modifier */}
        <button
          onClick={() => router.push("/profil/edit")}
          className="mt-2 text-primary flex items-center gap-1 text-sm border border-gray-400 rounded-full px-3 py-1"
        >
          <PencilIcon className="w-4 h-4" />
          Modifier le profil
        </button>

        {/* Grille de liens */}
        <div className="grid grid-cols-2 gap-4 mt-6 w-full max-w-xs">
          <button
            onClick={() => router.push("/reservations")}
            className="flex flex-col items-center justify-center bg-blue-50 rounded-2xl p-4 shadow-sm"
          >
            <CalendarIcon className="w-8 h-8 text-black mb-1" />
            <span className="text-sm text-primary font-medium text-center">
              Mes réservations<br />de cours
            </span>
          </button>

          <button
            onClick={() => router.push("/annonces")}
            className="flex flex-col items-center justify-center bg-blue-50 rounded-2xl p-4 shadow-sm"
          >
            <FolderIcon className="w-8 h-8 text-black mb-1" />
            <span className="text-sm text-primary font-medium text-center">Mes annonces</span>
          </button>

          <button
            onClick={() => router.push("/confidentialite")}
            className="flex flex-col items-center justify-center bg-blue-50 rounded-2xl p-4 shadow-sm"
          >
            <ShieldCheckIcon className="w-8 h-8 text-black mb-1" />
            <span className="text-sm text-primary font-medium text-center">
              CGU &<br />Confidentialité
            </span>
          </button>

          <button
            onClick={() => router.push("/securite")}
            className="flex flex-col items-center justify-center bg-blue-50 rounded-2xl p-4 shadow-sm"
          >
            <LockClosedIcon className="w-8 h-8 text-black mb-1" />
            <span className="text-sm font-medium text-primary text-center">Sécurité</span>
          </button>
        </div>
      </div>


    </MobileLayout>
  );
}
