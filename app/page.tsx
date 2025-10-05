"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import Button from "../components/Buttons";

export default function Home() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false); // NEW STATE

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setMessage("Veuillez entrer votre email");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
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
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-2xl font-extrabold text-gray-900">
            Bienvenue sur
          </h2>
          <Image
            width={100}
            height={28}
            className="mx-auto h-20 sm:h-24 md:h-28 lg:h-32 w-auto"
            src="/logo.png"
            alt="Logo"
          />
          <h2 className="mt-6 font-normal text-gray-900">
            Ton réseau pour apprendre et partager
          </h2>
        </div>

        {!showForm ? (
          // --- START BUTTON ---
          <div className="flex justify-center mt-8">
            <Button onClick={() => setShowForm(true)} variant="primary">
              Continuer avec mon e-mail
            </Button>
          </div>
        ) : (
          // --- FORM WITH TRANSITION ---
          <form
            onSubmit={handleSignIn}
            className={`mt-8 space-y-6 transform transition-all duration-1000 ease-in-out 
              ${showForm ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
          >
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
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 
                           placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 
                           focus:border-[#D4EEFF] focus:z-10 sm:text-sm"
                placeholder="Adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <Button type="submit" variant="primary" disabled={loading}>
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
        )}
      </div>
    </div>
  );
}
