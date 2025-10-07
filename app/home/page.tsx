"use client";

import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MobileLayout from "../components/MobileLayout";
import Card from "../components/Card";
import Image from "next/image";
import Button from "../components/Buttons";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  surname: string;
  user_type: "Professeur" | "Etudiant";
  created_at: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [{ data: userData }, profileRes] = await Promise.all([
        supabase.auth.getUser(),
        fetch("/api/profiles"),
      ]);

      if (!userData?.user) {
        router.push("/");
        return;
      }

      setUser(userData.user);
      if (profileRes.ok) {
        const profileJson = await profileRes.json();
        setProfile(profileJson);
      }
      setLoading(false);
    };

    load();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <MobileLayout title="Accueil">

        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-lg">Chargement...</div>
        </div>
      </MobileLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <MobileLayout title="Accueil">
      <div className="p-4">
        {/* Section Bonjour */}
        <div className="flex items-center gap-3 mb-4">
          <Image
            src="/placeholder-avatar.png"
            alt="Avatar"
            width={60}
            height={60}
            className="rounded-full"
          />
          <div>
            <h2 className="text-lg text-primary font-semibold">Bonjour Adrien 👋</h2>
            <p className="text-sm text-black">
              Prêt à apprendre et partager ?
            </p>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex flex-col gap-3 mb-6">
          <input
            type="text"
            placeholder="Chercher un cours"
            className="w-full border border-gray-300 rounded-full px-4 py-2  focus:outline-none"
          />
          <Button
            variant="primary"
            onClick={() => router.push("/propose-course")}
          >Proposer un cours</Button>
        </div>

        {/* Prochains cours */}
        <section className="mb-6">
          <h3 className="font-semibold text-primary text-lg border-b border-gray-300 pb-1 mb-2">
            Tes prochains cours
          </h3>
          <p className="text-sm text-gray-500">
            Tu n’as pas encore réservé de cours
          </p>
        </section>

        {/* Recommandations */}
        <section>
          <h3 className="font-semibold text-lg text-primary mb-3">Recommandations</h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            <Card
              tag="Populaire"
              title="Marketing digital"
              description="Boostez vos ventes grâce au digital"
              price="15€"
              teacher="Jade"
              rating={4.9}
              distance="1,5 km"
              image="/placeholder.jpg"
            />
            <Card
              tag="Nouveau"
              title="Alimentation durable"
              description="Mangez sain, protégez la planète"
              price="12€"
              teacher="Tim"
              rating={4.7}
              distance="1,2 km"
              image="/placeholder.jpg"
            />
          </div>
        </section>
      </div>
    </MobileLayout>
  );
}
