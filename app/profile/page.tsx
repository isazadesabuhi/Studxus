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
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.push("/");
        return;
      }

      setUser(user);

      // Get user profile data
      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
        } else {
          setProfile(profileData);
        }
      } catch (error) {
        console.error("Error in profile fetch:", error);
      }

      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.push("/");
      } else if (event === "SIGNED_IN") {
        setUser(session.user);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Bienvenue sur votre profil
          </h1>

          <div className="space-y-4 mb-8 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm font-medium">Email</p>
                <p className="text-gray-900 font-semibold">{user.email}</p>
              </div>

              {profile && (
                <>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600 text-sm font-medium">Prénom</p>
                    <p className="text-gray-900 font-semibold">
                      {profile.name}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600 text-sm font-medium">
                      Nom de famille
                    </p>
                    <p className="text-gray-900 font-semibold">
                      {profile.surname}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600 text-sm font-medium">
                      Type d'utilisateur
                    </p>
                    <p className="text-gray-900 font-semibold">
                      {profile.user_type === "Professeur"
                        ? "Professeur"
                        : "Etudiant"}
                    </p>
                  </div>
                </>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm font-medium">
                  ID utilisateur
                </p>
                <p className="text-gray-900 font-mono text-xs">{user.id}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
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
              <div className="bg-gray-50 p-4 rounded-lg">
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
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
