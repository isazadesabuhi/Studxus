"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log(email)
  console.log(supabase)
  const checkUserExists = async (email: string) => {
    try {
      // Check if user exists in auth.users
      const { data, error } = await supabase.rpc("check_user_exists", {
        user_email: email,
      });

      if (error) {
        console.error("Error checking user:", error);
        return false;
      }

      return data;
    } catch (error) {
      console.error("Error in checkUserExists:", error);
      return false;
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setMessage("Veuillez entrer votre email");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // First check if user exists
      const userExists = await checkUserExists(email);

      if (userExists) {
        // User exists, send magic link for signin
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/profile`,
          },
        });

        if (error) {
          setMessage(`Erreur: ${error.message}`);
        } else {
          setMessage("Vérifiez votre email pour le lien de connexion!");
        }
      } else {
        // User doesn't exist, redirect to signup
        router.push(`/signup?email=${encodeURIComponent(email)}`);
      }
    } catch (error) {
      setMessage(`Une erreur inattendue s'est produite: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Se connecter avec votre email
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
          <div>
            <label htmlFor="email" className="sr-only">
              Adresse email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Vérification..." : "Continuer"}
            </button>
          </div>

          {message && (
            <div
              className={`text-center text-sm ${
                message.includes("Erreur") ? "text-red-600" : "text-green-600"
              }`}
            >
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
