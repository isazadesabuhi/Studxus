"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";

interface EditProfileForm {
  name: string;
  surname: string;
  userType: "Professeur" | "Etudiant";
  address: string;
  city: string;
  country: string;
  postalCode: string;
  interests: string[];
  latitude: number | null;
  longitude: number | null;
}

interface AddressData {
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  postalCode: string;
}

const AddressPicker = dynamic(() => import("@/components/AddressPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[200px] bg-gray-100 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Chargement de la carte...</p>
    </div>
  ),
});

export default function EditProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState<EditProfileForm>({
    name: "",
    surname: "",
    userType: "Etudiant",
    address: "",
    city: "",
    country: "",
    postalCode: "",
    interests: [],
    latitude: null,
    longitude: null,
  });
  const [availableInterests, setAvailableInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        router.push("/");
        return;
      }

      const token = sessionData.session.access_token;

      try {
        const [profileRes, interestsRes] = await Promise.all([
          fetch("/api/profiles", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/users/interests", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (profileRes.ok) {
          const profile = await profileRes.json();
          setForm({
            name: profile.name || "",
            surname: profile.surname || "",
            userType: profile.user_type || "Etudiant",
            address: profile.address || "",
            city: profile.city || "",
            country: profile.country || "",
            postalCode: profile.postal_code || "",
            interests: profile.interests || [],
            latitude: profile.latitude ?? null,
            longitude: profile.longitude ?? null,
          });
        }

        if (interestsRes.ok) {
          const interestsData = await interestsRes.json();
          setAvailableInterests(interestsData.available_interests || []);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        setMessage("Impossible de charger votre profil pour le moment.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleInterest = (interest: string) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleAddressSelect = (address: AddressData) => {
    setForm((prev) => ({
      ...prev,
      address: address.address,
      city: address.city,
      country: address.country,
      postalCode: address.postalCode,
      latitude: address.latitude,
      longitude: address.longitude,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setSaving(true);

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      router.push("/");
      return;
    }

    try {
      const res = await fetch("/api/profiles", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({
          name: form.name,
          surname: form.surname,
          userType: form.userType,
          address: form.address,
          city: form.city,
          country: form.country,
          postalCode: form.postalCode,
          interests: form.interests,
          latitude: form.latitude,
          longitude: form.longitude,
        }),
      });

      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        setMessage(detail?.error || "La mise a jour a echoue.");
        return;
      }

      router.push("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Une erreur est survenue lors de la mise a jour.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Chargement du profil...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Modifier mon profil</h1>
          <Link href="/profile" className="text-sm text-primary underline">
            Annuler
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Prenom
              </label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nom
              </label>
              <input
                name="surname"
                value={form.surname}
                onChange={onChange}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type d'utilisateur
            </label>
            <select
              name="userType"
              value={form.userType}
              onChange={onChange}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2"
            >
              <option value="Etudiant">Etudiant</option>
              <option value="Professeur">Professeur</option>
            </select>
          </div>

          <div className="space-y-4">
            <AddressPicker
              onAddressSelect={handleAddressSelect}
              initialValue={form.address || undefined}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ville
                </label>
                <input
                  name="city"
                  value={form.city}
                  onChange={onChange}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Adresse selectionnee
                </label>
                <input
                  name="address"
                  value={form.address}
                  onChange={onChange}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pays
              </label>
              <input
                name="country"
                value={form.country}
                onChange={onChange}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Code postal
              </label>
              <input
                name="postalCode"
                value={form.postalCode}
                onChange={onChange}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2"
              />
            </div>
          </div>

          {availableInterests.length > 0 && (
            <div>
              <p className="block text-sm font-medium text-gray-700 mb-2">
                Centres d'interet
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableInterests.map((interest) => (
                  <label
                    key={interest}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer ${
                      form.interests.includes(interest)
                        ? "border-primary bg-blue-50"
                        : "border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.interests.includes(interest)}
                      onChange={() => toggleInterest(interest)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">{interest}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {message && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              {message}
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <Link href="/profile" className="text-sm underline">
              Retour au profil
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 font-medium disabled:opacity-60"
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
