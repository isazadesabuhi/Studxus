"use client";

import { useState, useEffect, Suspense, use } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import mascotte_v1 from "@/public/mascotte_v1.png";
import Button from "../../components/Buttons";

interface AddressData {
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  postalCode: string;
}

// Dynamically import AddressPicker to avoid SSR issues with Mapbox
const AddressPicker = dynamic(() => import("@/components/AddressPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});

function SignupForm() {
  // --- Step control ---------------------------------------------------------
  const [step, setStep] = useState<1 | 2>(1); // NEW

  // --- Form state -----------------------------------------------------------
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    surname: "",
    userType: "Professeur" as "Professeur" | "Etudiant",
  });
  const [addressData, setAddressData] = useState<AddressData | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set()); // interests
  const [errors, setErrors] = useState<Record<string, string>>({}); // NEW

  // --- UX state -------------------------------------------------------------
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();

  // If already signed in → redirect
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) router.push("/accueil");
    };
    checkUser();
  }, [router]);

  // prefill email from query
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setFormData((prev) => ({ ...prev, email: emailParam }));
    }
  }, [searchParams]);

  // handlers
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // clear per-field error as user types
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAddressSelect = (address: AddressData) => {
    setAddressData(address);
    setErrors((prev) => ({ ...prev, address: "" }));
  };

  // --- Validation for Step 1 ------------------------------------------------
  const validateStep1 = () => {
    const nextErrors: Record<string, string> = {};
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) nextErrors.email = "L’e-mail est requis.";
    else if (!emailRe.test(formData.email))
      nextErrors.email = "Format d’e-mail invalide.";

    if (!formData.name) nextErrors.name = "Le prénom est requis.";
    if (!formData.surname) nextErrors.surname = "Le nom est requis.";
    if (!addressData) nextErrors.address = "Sélectionnez votre adresse.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // --- Navigation between steps --------------------------------------------
  const goNext = () => {
    setMessage("");
    if (validateStep1()) {
      setStep(2);
      // optionally scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goBack = () => setStep(1);

  //
  const [serverInterests, setServerInterests] = useState<Option[] | null>(null);
  const [interestsLoading, setInterestsLoading] = useState(false);
  const [interestsError, setInterestsError] = useState("");
  // NEW: GET request to fetch interests from your API
  const loadInterests = async () => {
    setInterestsLoading(true);
    setInterestsError("");
    try {
      const res = await fetch("/api/users/interests", {
        method: "GET",
        headers: { Accept: "application/json" },
        // credentials: "include", // uncomment if your API needs cookies/session
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // Expecting `data` to be an array of { id, label, icon? } (you'll shape it later)
      setServerInterests(data?.available_interests);
    } catch (err: any) {
      setInterestsError("Impossible de charger les centres d’intérêt.");
      console.error("loadInterests error:", err);
    } finally {
      setInterestsLoading(false);
    }
  };

  // NEW: when user reaches step 2, fetch interests
  useEffect(() => {
    if (step === 2 && serverInterests === null && !interestsLoading) {
      loadInterests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  console.log("serverInterests:", serverInterests);

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  // --- Final sign up on Step 2 ---------------------------------------------
  const handleSignUp = async () => {
    setMessage("");
    setLoading(true);
    try {
      // Create user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: Math.random().toString(36), // temp random password
        options: {
          emailRedirectTo: `${window.location.origin}/accueil`,
          data: {
            name: formData.name,
            surname: formData.surname,
            user_type: formData.userType,
            address: addressData?.address,
            city: addressData?.city,
            country: addressData?.country,
            latitude: addressData?.latitude,
            longitude: addressData?.longitude,
            postal_code: addressData?.postalCode,
            interests: Array.from(selectedInterests), // NEW: save interests in user metadata
          },
        },
      });

      if (error) {
        setMessage(`Erreur: ${error.message}`);
        return;
      }

      if (data.user) {
        // Create the profile in your DB
        const response = await fetch("/api/profiles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: data.user.id,
            email: formData.email,
            name: formData.name,
            surname: formData.surname,
            userType: formData.userType,
            address: addressData?.address,
            city: addressData?.city,
            country: addressData?.country,
            latitude: addressData?.latitude,
            longitude: addressData?.longitude,
            postalCode: addressData?.postalCode,
            interests: Array.from(selectedInterests), // NEW: send to API
          }),
        });

        if (!response.ok) {
          console.error("Profile creation failed", await response.json());
        }

        setMessage("Compte créé ! Vérifie ton e-mail pour activer ton compte.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Une erreur inattendue s'est produite.");
    } finally {
      setLoading(false);
    }
  };

  // --- UI -------------------------------------------------------------------
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
              <div className="absolute flex flex-col items-center justify-center text-center text-[#1A3A60] px-[10px]">
                <span className="text-base leading-tight">Bienvenue !</span>
                <span className="text-sm leading-tight">
                  Pour commencer, j’ai quelques questions pour toi
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 1: Infos personnelles */}
        {step === 1 && (
          <div className="mt-6 space-y-6">
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Quel est ton e-mail ?
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-[#D4EEFFCC]"
                  placeholder="votre.email@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
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
                    className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-[#D4EEFFCC]"
                    placeholder="Votre prénom"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="surname"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Quel est ton nom ?
                  </label>
                  <input
                    id="surname"
                    name="surname"
                    type="text"
                    autoComplete="family-name"
                    className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-[#D4EEFFCC]"
                    placeholder="Votre nom de famille"
                    value={formData.surname}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  {errors.surname && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.surname}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <AddressPicker onAddressSelect={handleAddressSelect} />
                {errors.address && (
                  <p className="mt-2 text-sm text-red-600">{errors.address}</p>
                )}
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

            {/* Buttons for step 1 */}
            <div className="flex justify-center">
              <Button
                type="button"
                variant="secondary"
                onClick={goNext}
                disabled={loading}
              >
                Suivant
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
          </div>
        )}

        {/* STEP 2: Interests + Create */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold">
              Quels sujets t’intéressent ?
            </h2>
            <div className="space-y-3">
              <div className="space-y-3 mt-4">
                {serverInterests?.map((interest) => (
                  <label
                    key={interest}
                    className={`flex items-center gap-3 cursor-pointer rounded-xl border px-4 py-3 transition-all ${
                      selectedInterests.includes(interest)
                        ? "bg-blue-100 border-blue-500"
                        : "bg-white border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={interest}
                      checked={selectedInterests.includes(interest)}
                      onChange={() => toggleInterest(interest)}
                      className="h-5 w-5 accent-blue-600"
                    />
                    <span className="text-gray-800 font-medium">
                      {interest}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button type="button" variant="ghost" onClick={goBack}>
                Retour
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleSignUp}
                disabled={loading}
              >
                {loading ? "Création..." : "Créer le compte"}
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
          </div>
        )}
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
