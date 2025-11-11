"use client";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import type { User } from "@supabase/supabase-js";

import {
  ArrowLeft,
  Share2,
  Pencil,
  CalendarCheck2,
  FolderClosed,
  ShieldCheck,
  Lock,
  LogOut,
  CheckCircle,
  CirclePlus,
} from "lucide-react";

import avatar from "@/public/avatar.svg";
import Heading from "@/components/Heading";
import { useEffect, useState } from "react";
import { UserProfile } from "../types/UserProfile";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user) {
        router.push("/");
        return;
      }

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
            console.log("Fetched profile data:", profileData);
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
    <main className="min-h-dvh bg-white text-neutral-900">
      {profile && (
        <>
          {/* Safe width for mobile */}
          <div className="mx-auto w-full max-w-md px-4 pb-10">
            {/* Top bar */}
            <header className="flex items-center justify-between py-3">
              <button
                aria-label="Retour"
                className="rounded-full border border-neutral-200 p-2 active:scale-95"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  aria-label="Partager"
                  className="rounded-full border border-neutral-200 p-2 active:scale-95"
                >
                  <Share2 className="h-5 w-5" />
                </button>
                <button
                  onClick={handleSignOut}
                  aria-label="Se déconnecter"
                  className="rounded-full border border-neutral-200 p-2 active:scale-95"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </header>

            {/* Avatar */}
            <section className="flex flex-col items-center">
              <div className="relative h-28 w-28 overflow-hidden rounded-full ring-4 ring-neutral-100">
                {/* Put an image in /public/avatar.png or swap the src */}
                <Image
                  src={avatar}
                  alt="Photo de profil"
                  fill
                  className="object-cover"
                  sizes="112px"
                  priority
                />
              </div>

              <h1 className="mt-4 text-2xl font-extrabold tracking-tight">
                {profile.name} {profile.surname}
              </h1>

              <button className="mt-3 inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium shadow-sm hover:bg-neutral-50 active:scale-[0.98]">
                <Pencil className="h-4 w-4" />
                Modifier le profil
              </button>
            </section>

            {/* --- Vérification du profil --- */}
            <section className="mt-6   ">
              <p className="w-full h-0.5 my-4 border-t-2 border-primary"></p>
              <Heading as="h4" className="text-2xl text-primary font-semibold">
                Vérifiez votre profil
              </Heading>

              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <CirclePlus className="text-yellow-400 w-5 h-5" />
                  Vérifier une pièce d’identité
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="text-yellow-400 w-5 h-5" />
                  {profile.email}
                </li>
                <li className="flex items-center gap-2">
                  {/* {profile.telephone ? (
                    <>
                      <CheckCircle className="text-yellow-400 w-5 h-5" />
                      Téléphone vérifié : {profile.telephone}
                    </>
                  ) : (
                    <>
                      <BanIcon className="text-red-400 w-5 h-5" />
                      Téléphone non renseigné
                    </>
                  )} */}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="text-yellow-400 w-5 h-5" />
                  {profile.address}
                </li>
              </ul>
            </section>

            {/* --- Fiabilité --- */}
            <section className="mt-6    pb-10">
              <p className="w-full h-0.5 my-4 border-t-2 border-primary"></p>
              <Heading as="h4" className="text-2xl text-primary font-semibold">
                Votre fiabilité
              </Heading>

              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="text-green-500 w-5 h-5 mt-0.5" />
                  N’annule jamais de réservation en tant qu’apprenant
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="text-green-500 w-5 h-5 mt-0.5" />
                  N’annule jamais de réservation en tant qu’enseignant
                </li>
              </ul>
            </section>

            {/* Quick actions grid */}
            <section className="mt-6 grid grid-cols-2 gap-4 sm:gap-5">
              <Link className="w-full" href="/cours/reserves">
                <Card
                  icon={<CalendarCheck2 className="h-7 w-7" aria-hidden />}
                  label={
                    <>
                      Mes réservations
                      <br /> de cours
                    </>
                  }
                />
              </Link>
              <Link className="" href="/cours/enseignes">
                <Card
                  icon={<FolderClosed className="h-7 w-7" aria-hidden />}
                  label={<>Mes annonces</>}
                />
              </Link>
              <Link href="/cgu-confidentialite" >
              <Card
                icon={<ShieldCheck className="h-7 w-7" aria-hidden />}
                label={
                  <>
                    CGU &nbsp;&
                    <br />
                    Confidentialité
                  </>
                }
              />
              </Link>
              <Link href="/securite">
              <Card
                icon={<Lock className="h-7 w-7" aria-hidden />}
                label={<>Sécurité</>}
              />
              </Link>
            </section>
          </div>
        </>
      )}
    </main>
  );
}
