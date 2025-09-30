"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  surname: string;
  user_type: "Professeur" | "Etudiant";
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Bienvenue sur votre profil
          </h1>

          <div className="space-y-6 mb-10 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-600 text-sm font-medium">Email</p>
                <p className="text-gray-900 font-semibold">{user.email}</p>
              </div>

              {profile && (
                <>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-gray-600 text-sm font-medium">Prénom</p>
                    <p className="text-gray-900 font-semibold">
                      {profile.name}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-gray-600 text-sm font-medium">
                      Nom de famille
                    </p>
                    <p className="text-gray-900 font-semibold">
                      {profile.surname}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-gray-600 text-sm font-medium">
                      Type d&apos;utilisateur
                    </p>
                    <p className="text-gray-900 font-semibold">
                      {profile.user_type === "Professeur"
                        ? "Professeur"
                        : "Etudiant"}
                    </p>
                  </div>
                </>
              )}

              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-600 text-sm font-medium">
                  ID utilisateur
                </p>
                <p className="text-gray-900 font-mono text-xs">{user.id}</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-600 text-sm font-medium">
                  Dernière connexion
                </p>
                <p className="text-gray-900 font-semibold">
                  {user.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleString("fr-FR")
                    : "Jamais"}
                </p>
              </div>
            </div>

            {profile && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-600 text-sm font-medium">
                  Compte créé le
                </p>
                <p className="text-gray-900 font-semibold">
                  {new Date(profile.created_at).toLocaleString("fr-FR")}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleSignOut}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
