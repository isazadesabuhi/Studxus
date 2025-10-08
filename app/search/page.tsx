"use client";

import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import MobileLayout from "../components/MobileLayout";

import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import Button from "../components/Buttons";
import CourseCard from "../components/CourseCard";
import { FunnelIcon } from "@heroicons/react/16/solid";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
mapboxgl.accessToken = MAPBOX_TOKEN;


interface UserProfile {
  id: string;
  email: string;
  name: string;
  surname: string;
  user_type: "Professeur" | "Etudiant";
  created_at: string;
}

export default function Search() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mode, setMode] = useState<"map" | "list">("map");

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Points fictifs
  const cours = [
    {
      id: 1,
      title: "Jardinage urbain",
      subtitle: "Cultivez vos plantes en ville",
      longitude: 4.8357,
      latitude: 45.764,
      prix: "10€/h",
    },
    {
      id: 2,
      title: "Potager BIO facile",
      subtitle: "Des légumes sains chez vous",
      longitude: 4.84,
      latitude: 45.76,
      prix: "13€/h",
    },
  ];

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Initialisation de la carte
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [4.8357, 45.764],
      zoom: 13,
    });

    // Ajout du contrôleur de recherche (geocoder)
    const geocoder = new MapboxGeocoder({
      accessToken: MAPBOX_TOKEN,
      mapboxgl: mapboxgl as any,
      placeholder: "Rechercher un lieu...",
      marker: false,
      collapsed: true,
    });

    map.addControl(geocoder, "top-left");

    // Ajout de la navigation
    map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    // Ajout des marqueurs
    cours.forEach((c) => {
      const el = document.createElement("div");
      el.className = "marker";
      el.innerHTML = `
        <div class="flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="#1e3a8a" viewBox="0 0 24 24" class="w-6 h-6 drop-shadow">
            <path d="M12 2C8.1 2 5 5.1 5 9c0 5.3 7 13 7 13s7-7.7 7-13c0-3.9-3.1-7-7-7z"/>
          </svg>
        </div>
      `;
      new mapboxgl.Marker(el)
        .setLngLat([c.longitude, c.latitude])
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>${c.title}</strong><br>${c.subtitle}`))
        .addTo(map);
    });

    mapRef.current = map;

    return () => map.remove();
    const load = async () => {
      setLoading(true);
      const [{ data: userData }, profileRes] = await Promise.all([
        supabase.auth.getUser(),
        fetch("/api/profiles"),
      ]);

      if (!userData?.user) {
        router.push("/");
        return;
      }

      setUser(userData.user);
      if (profileRes.ok) {
        const profileJson = await profileRes.json();
        setProfile(profileJson);
      }
      setLoading(false);

    };


    load();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <MobileLayout title="Recherche">

        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-lg text-primary">Chargement...</div>
        </div>
      </MobileLayout>
    );
  }

  /*   if (!user) {
      return null;
    } */

  return (
    <MobileLayout title="Recherche">
      <div className="relative h-[calc(100vh-8rem)]">
        {/* Header : bouton filtre */}
        <div className="absolute top-4 right-4 z-10 flex items-center bg-white rounded-full shadow px-3 py-2">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="px-4 py-2 bg-indigo-900 text-white rounded-full"
          >
            Filtrer
          </button>
        </div>

        {/* Vue Carte */}
        {mode === "map" && (
          <>
            <div ref={mapContainer} className="w-full h-full" />
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[90%] bg-white rounded-2xl shadow-md p-3">
              <div className="text-sm text-center text-gray-800 font-semibold mb-2">
                {cours[0].title}
              </div>
              <Button
                variant="primary"
                onClick={() => setMode("list")}
                className="w-full"
              >
                Voir la liste
              </Button>
            </div>
          </>
        )}

        {/* Vue Liste */}
        {mode === "list" && (
          <div className="p-4 overflow-y-auto h-[calc(100vh-14rem)] bg-white">
            {cours.map((c) => (
              <CourseCard
                key={c.id}
                title={c.title}
                subtitle={c.subtitle}
                level="Débutant"
                price={c.prix}
                teacher="Sarah"
                rating={4.8}
                distance="0,4 km"
                image="/images/jardin1.png"
              />
            ))}
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[90%]">
              <Button
                variant="primary"
                onClick={() => setMode("map")}
                className="w-full"
              >
                Voir sur la carte
              </Button>
            </div>
          </div>
        )}
        
      </div>
    </MobileLayout>
  );
}
