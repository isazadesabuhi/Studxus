"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setMessage("Veuillez entrer votre email");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Check if user exists using the API endpoint
      const checkResponse = await fetch("/api/auth/check-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!checkResponse.ok) {
        setMessage("Erreur lors de la vérification de l'utilisateur");
        setLoading(false);
        return;
      }

      const { exists } = await checkResponse.json();

      if (exists) {
        // User exists - use Supabase client-side method to send magic link
        // This ensures proper session handling when the link is clicked
        const { error } = await supabase.auth.signInWithOtp({
          email: email,
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
        window.location.href = `/signup?email=${encodeURIComponent(email)}`;
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Une erreur inattendue s'est produite");
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
