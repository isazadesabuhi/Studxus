"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Button from "./components/Buttons";

export default function Home() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {


        router.push(`/signup?email=${encodeURIComponent(email)}`);
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full space-y-8">
        <div>
          <img
           className="mx-auto h-20 sm:h-24 md:h-28 lg:h-32 w-auto"
            src="/logo.png"
            alt="Logo"
          />
          <h2 className="mt-6 text-center text-2xl font-extrabold text-gray-900">
            Bienvenue !
          </h2>
          <h1 className="mt-6 text-center  font-normal text-gray-900">
            Merci de renseigner ton email
          </h1>
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
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? "Vérification..." : "Continuer"}
            </Button>
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
