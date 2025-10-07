"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import mascotte_v1 from "@/public/mascotte_v1.png";

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
import Button from "../../components/Buttons";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Image
            width={100}
            height={28}
            className="mx-auto h-16 sm:h-24 md:h-28 lg:h-32 w-auto"
            src="/logo.png"
            alt="Logo"
          />
          <div className="flex flex-row">
            <Image
              src={mascotte_v1}
              width={100}
              height={120}
              alt="mascotte_v1"
            />

            <div className="relative w-[203px] h-[101px] flex items-center justify-center">
              {/* SVG background */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="203"
                height="101"
                viewBox="0 0 203 101"
                fill="none"
                className="absolute inset-0"
              >
                <mask id="path-1-inside-1_2147_3118" fill="white">
                  <path d="M187 0C195.836 0 203 7.16344 203 16V79.8145C203 88.651 195.836 95.8145 187 95.8145H34.5701L3.10284 99.9968C1.51483 100.208 0.335531 98.5595 1.04803 97.1247L9.53916 80.0257C9.67643 79.7493 9.74786 79.4449 9.74786 79.1362V16C9.74786 7.16344 16.9113 0 25.7479 0H187Z" />
                </mask>
                <path
                  d="M34.5701 95.8145V93.8145H34.4378L34.3066 93.8319L34.5701 95.8145ZM9.53916 80.0257L11.3305 80.9153L9.53916 80.0257ZM3.10284 99.9968L2.83933 98.0143L3.10284 99.9968ZM1.04803 97.1247L2.83933 98.0143L1.04803 97.1247ZM187 0V2C194.732 2 201 8.26801 201 16H203H205C205 6.05887 196.941 -2 187 -2V0ZM203 16H201V79.8145H203H205V16H203ZM203 79.8145H201C201 87.5464 194.732 93.8145 187 93.8145V95.8145V97.8145C196.941 97.8145 205 89.7556 205 79.8145H203ZM187 95.8145V93.8145H34.5701V95.8145V97.8145H187V95.8145ZM34.5701 95.8145L34.3066 93.8319L2.83933 98.0143L3.10284 99.9968L3.36634 101.979L34.8336 97.797L34.5701 95.8145ZM1.04803 97.1247L2.83933 98.0143L11.3305 80.9153L9.53916 80.0257L7.74786 79.1362L-0.743261 96.2352L1.04803 97.1247ZM9.74786 79.1362H11.7479V16H9.74786H7.74786V79.1362H9.74786ZM9.74786 16H11.7479C11.7479 8.26801 18.0159 2 25.7479 2V0V-2C15.8067 -2 7.74786 6.05887 7.74786 16H9.74786ZM25.7479 0V2H187V0V-2H25.7479V0ZM9.53916 80.0257L11.3305 80.9153C11.605 80.3624 11.7479 79.7535 11.7479 79.1362H9.74786H7.74786L9.53916 80.0257ZM3.10284 99.9968L2.83933 98.0143L2.83933 98.0143L1.04803 97.1247L-0.743261 96.2352C-2.16827 99.1048 0.190345 102.402 3.36634 101.979L3.10284 99.9968Z"
                  fill="#FAB818"
                  mask="url(#path-1-inside-1_2147_3118)"
                />
              </svg>

              {/* Two lines of centered text */}
              <div className="absolute flex flex-col items-center justify-center text-center text-[#1A3A60] px-[10px]">
                <span className="text-base leading-tight">Bienvenue !</span>
                <span className="text-sm leading-tight">
                  Pour commencer, j’ai quelques questions pour toi
                </span>
              </div>
            </div>
          </div>
          {/* <h2 className="mt-6 text-center text-2xl font-extrabold text-gray-900">
            Créer un compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Remplissez les informations ci-dessous
          </p> */}
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSignUp}>
          <div className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Quel est ton e-mail?
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-[#D4EEFFCC]"
                placeholder="votre.email@example.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1  gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Quel est ton prénom ?
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="given-name"
                  required
                  className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-[#D4EEFFCC]"
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
                  Quel est ton nom
                </label>
                <input
                  id="surname"
                  name="surname"
                  type="text"
                  autoComplete="family-name"
                  required
                  className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-[#D4EEFFCC]"
                  placeholder="Votre nom de famille"
                  value={formData.surname}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* <div>
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
            </div> */}

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
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Vérification..." : "Créer le compte"}
            </Button>
          </div>

          <div className="text-center">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Retour
            </Button>
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
