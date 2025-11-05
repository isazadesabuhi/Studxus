"use client";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";

import {
  ArrowLeft,
  Share2,
  HelpCircle,
  Pencil,
  CalendarCheck2,
  FolderClosed,
  ShieldCheck,
  Lock,
  LogOut,
} from "lucide-react";

import avatar from "@/public/avatar.svg";

export default function ProfilePage() {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <main className="min-h-dvh bg-white text-neutral-900">
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
            Adrien P.
          </h1>

          <button className="mt-3 inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium shadow-sm hover:bg-neutral-50 active:scale-[0.98]">
            <Pencil className="h-4 w-4" />
            Modifier le profil
          </button>
        </section>

        {/* Quick actions grid */}
        <section className="mt-6 grid grid-cols-2 gap-4 sm:gap-5">
          <Card
            icon={<CalendarCheck2 className="h-7 w-7" aria-hidden />}
            label={
              <>
                Mes réservations
                <br /> de cours
              </>
            }
          />
          <Card
            icon={<FolderClosed className="h-7 w-7" aria-hidden />}
            label={<>Mes annonces</>}
          />
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
          <Card
            icon={<Lock className="h-7 w-7" aria-hidden />}
            label={<>Sécurité</>}
          />
        </section>
      </div>
    </main>
  );
}
