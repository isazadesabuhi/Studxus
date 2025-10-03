"use client";

import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MobileLayout from "../components/MobileLayout";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  surname: string;
  user_type: "Professeur" | "Etudiant";
  created_at: string;
}

export default function Message() {
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
    <MobileLayout title="Messagerie">

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
    <MobileLayout title="Messagerie">
      <div>Messagerie</div>
    </MobileLayout>
  );
}
