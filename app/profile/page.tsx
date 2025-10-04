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
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Bienvenue sur votre profil
          </h1>

          <div className="space-y-6 mb-10 text-left">
            {/* Personal Information */}
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Informations personnelles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-600 text-sm font-medium">Email</p>
                  <p className="text-gray-900 font-semibold">{user?.email}</p>
                </div>

                {profile && (
                  <>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <p className="text-gray-600 text-sm font-medium">
                        Prénom
                      </p>
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
              </div>
            </div>

            {/* Address Information */}
            {profile && profile.address && (
              <div className="border-b pb-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Adresse
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg md:col-span-2">
                    <p className="text-gray-600 text-sm font-medium">
                      Adresse complète
                    </p>
                    <p className="text-gray-900 font-semibold">
                      {profile.address}
                    </p>
                  </div>

                  {profile.city && (
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <p className="text-gray-600 text-sm font-medium">Ville</p>
                      <p className="text-gray-900 font-semibold">
                        {profile.city}
                      </p>
                    </div>
                  )}

                  {profile.country && (
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <p className="text-gray-600 text-sm font-medium">Pays</p>
                      <p className="text-gray-900 font-semibold">
                        {profile.country}
                      </p>
                    </div>
                  )}

                  {profile.postal_code && (
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <p className="text-gray-600 text-sm font-medium">
                        Code postal
                      </p>
                      <p className="text-gray-900 font-semibold">
                        {profile.postal_code}
                      </p>
                    </div>
                  )}

                  {profile.latitude && profile.longitude && (
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <p className="text-gray-600 text-sm font-medium">
                        Coordonnées GPS
                      </p>
                      <p className="text-gray-900 font-mono text-xs">
                        Lat: {profile.latitude.toFixed(6)}
                        <br />
                        Long: {profile.longitude.toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* System Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Informations système
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-600 text-sm font-medium">
                    ID utilisateur
                  </p>
                  <p className="text-gray-900 font-mono text-xs">{user?.id}</p>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-600 text-sm font-medium">
                    Dernière connexion
                  </p>
                  <p className="text-gray-900 font-semibold">
                    {user?.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleString("fr-FR")
                      : "Jamais"}
                  </p>
                </div>

                {profile && (
                  <div className="bg-gray-50 p-6 rounded-lg md:col-span-2">
                    <p className="text-gray-600 text-sm font-medium">
                      Compte créé le
                    </p>
                    <p className="text-gray-900 font-semibold">
                      {new Date(profile.created_at).toLocaleString("fr-FR")}
                    </p>
                  </div>
                )}
              </div>
            </div>
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
