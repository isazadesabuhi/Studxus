"use client";

import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import AddressPicker to avoid SSR issues with Mapbox
const AddressPicker = dynamic(() => import("@/components/AddressPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});

interface AddressData {
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  postalCode: string;
}

function SignupForm() {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    surname: "",
    userType: "Professeur" as "Professeur" | "Etudiant",
  });
  const [addressData, setAddressData] = useState<AddressData | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setFormData((prev) => ({ ...prev, email: emailParam }));
    }
  }, [searchParams]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressSelect = (address: AddressData) => {
    setAddressData(address);
    console.log("Selected address:", address);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.name || !formData.surname) {
      setMessage("Veuillez remplir tous les champs requis");
      return;
    }

    if (!addressData) {
      setMessage("Veuillez sélectionner votre adresse sur la carte");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Create user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: Math.random().toString(36),
        options: {
          emailRedirectTo: `${window.location.origin}/profile`,
          data: {
            name: formData.name,
            surname: formData.surname,
            user_type: formData.userType,
            address: addressData.address,
            city: addressData.city,
            country: addressData.country,
            latitude: addressData.latitude,
            longitude: addressData.longitude,
            postal_code: addressData.postalCode,
          },
        },
      });

      if (error) {
        setMessage(`Erreur: ${error.message}`);
      } else if (data.user) {
        // Update profile via API
        const response = await fetch("/api/profiles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: data.user.id,
            email: formData.email,
            name: formData.name,
            surname: formData.surname,
            userType: formData.userType,
            address: addressData.address,
            city: addressData.city,
            country: addressData.country,
            latitude: addressData.latitude,
            longitude: addressData.longitude,
            postalCode: addressData.postalCode,
          }),
        });

        if (!response.ok) {
          console.error("Profile creation failed", await response.json());
        }

        setMessage(
          "Compte créé! Vérifiez votre email pour activer votre compte."
        );
      }
    } catch (error) {
      setMessage("Une erreur inattendue s'est produite");
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8 space-y-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Créer un compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Remplissez les informations ci-dessous
          </p>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSignUp}>
          <div className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="votre.email@example.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Prénom *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="given-name"
                  required
                  className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Votre prénom"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>

              <div>
                <label
                  htmlFor="surname"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nom de famille *
                </label>
                <input
                  id="surname"
                  name="surname"
                  type="text"
                  autoComplete="family-name"
                  required
                  className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Votre nom de famille"
                  value={formData.surname}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="userType"
                className="block text-sm font-medium text-gray-700"
              >
                {"Type d'utilisateur"} *
              </label>
              <select
                id="userType"
                name="userType"
                required
                className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 bg-white text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={formData.userType}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="Professeur">Professeur</option>
                <option value="Etudiant">Etudiant</option>
              </select>
            </div>

            {/* Address Picker */}
            <div>
              <AddressPicker
                onAddressSelect={handleAddressSelect}
                // initialAddress=""
              />
              {addressData && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Adresse sélectionnée:</strong>
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    {addressData.address}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {addressData.city}, {addressData.country}{" "}
                    {addressData.postalCode}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center rounded-lg bg-indigo-600 py-3 px-6 text-base font-medium text-white shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Création..." : "Créer le compte"}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Retour
            </button>
          </div>

          {message && (
            <div
              className={`text-center text-sm p-3 rounded-lg ${
                message.includes("Erreur")
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : "bg-green-50 text-green-600 border border-green-200"
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

function SignupLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-lg">Chargement...</div>
    </div>
  );
}

export default function Signup() {
  return (
    <Suspense fallback={<SignupLoading />}>
      <SignupForm />
    </Suspense>
  );
}
