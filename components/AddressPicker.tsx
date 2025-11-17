"use client";

import { useEffect, useRef, useState } from "react";

type LngLatLike = [number, number];

interface MapboxContextItem {
  id: string; // e.g. "place.123", "country.456", "postcode.789"
  text: string; // e.g. "Lyon", "France", "69000"
}

interface MapboxGeometry {
  type: "Point";
  coordinates: LngLatLike; // [lng, lat]
}

interface MapboxGeocodeFeature {
  id?: string;
  place_name?: string;
  text?: string;
  context?: MapboxContextItem[];
  geometry: MapboxGeometry;
}

interface AddressData {
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  postalCode: string;
}

interface AddressPickerProps {
  onAddressSelect: (address: AddressData) => void;
  initialValue?: string;
}

export default function AddressPicker({
  onAddressSelect,
  initialValue,
}: AddressPickerProps) {
  const [query, setQuery] = useState(initialValue ?? "");
  const [results, setResults] = useState<MapboxGeocodeFeature[]>([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState<number>(-1);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const fetchResults = async (
    search: string,
    signal?: AbortSignal
  ): Promise<void> => {
    if (!mapboxToken) {
      console.error("Mapbox token is not configured");
      return;
    }

    setLoading(true);
    try {
      const url = new URL(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          search
        )}.json`
      );
      url.searchParams.set("access_token", mapboxToken);
      url.searchParams.set("autocomplete", "true");
      url.searchParams.set("limit", "8");
      // Prioritize address-y things
      url.searchParams.set(
        "types",
        "address,place,locality,neighborhood,postcode,poi"
      );
      // Optional: bias to Lyon/France or user's area
      // url.searchParams.set("proximity", "4.8357,45.7640"); // [lng,lat]
      // url.searchParams.set("country", "FR");

      const res = await fetch(url.toString(), { signal });
      const data: { features?: MapboxGeocodeFeature[] } = await res.json();

      setResults(data.features ?? []);
      setOpen(true);
      setHighlighted(data.features && data.features.length ? 0 : -1);
    } catch (err) {
      if ((err as any).name !== "AbortError") {
        console.error("Geocoding error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setQuery(initialValue ?? "");
  }, [initialValue]);

  useEffect(() => {
    // close dropdown on outside click
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setHighlighted(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!mapboxToken) {
      console.error("Mapbox token is not configured");
      return;
    }

    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      setHighlighted(-1);
      return;
    }

    // Debounce user input
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      // Cancel previous request if any
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      fetchResults(query, controller.signal);
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, mapboxToken]);

  function parseGeocoderResult(
    result: MapboxGeocodeFeature
  ): Omit<AddressData, "latitude" | "longitude"> {
    let address = result.place_name || result.text || "";
    let city = "";
    let country = "";
    let postalCode = "";

    result.context?.forEach((item: MapboxContextItem) => {
      if (item.id.startsWith("place")) {
        city = item.text;
      } else if (item.id.startsWith("country")) {
        country = item.text;
      } else if (item.id.startsWith("postcode")) {
        postalCode = item.text;
      }
    });

    // If top-level text is a more specific string, keep place_name as full fallback.
    if (result.text) {
      address = result.place_name || result.text;
    }

    return { address, city, country, postalCode };
  }

  function handleSelect(feature: MapboxGeocodeFeature) {
    const coords = feature.geometry.coordinates; // [lng, lat]
    const base = parseGeocoderResult(feature);
    onAddressSelect({
      ...base,
      latitude: coords[1],
      longitude: coords[0],
    });
    setQuery(base.address);
    setOpen(false);
    setHighlighted(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => (h + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => (h - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const choice =
        highlighted >= 0 ? results[highlighted] : results[0] ?? null;
      if (choice) handleSelect(choice);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="w-full space-y-2">
      <label
        htmlFor="address"
        className="block text-sm font-medium text-gray-700 text-left"
      >
        Adresse
      </label>

      <div className="relative">
        <input
          id="address"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length) {
              setOpen(true);
            } else {
              const seed = query.trim().length ? query : "rue";
              fetchResults(seed);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="Recherchez votre adresse…"
          autoComplete="off"
          className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-[#D4EEFFCC]"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="address-suggestions"
          aria-activedescendant={
            highlighted >= 0 && results[highlighted]?.id
              ? `option-${results[highlighted].id}`
              : undefined
          }
        />

        {/* Loading spinner (minimal) */}
        {loading && (
          <div className="absolute right-3 top-2.5 animate-spin">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                opacity="0.25"
              />
              <path
                d="M22 12a10 10 0 0 1-10 10"
                stroke="currentColor"
                strokeWidth="4"
              />
            </svg>
          </div>
        )}

        {/* Suggestions */}
        {open && results.length > 0 && (
          <ul
            id="address-suggestions"
            role="listbox"
            className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg"
          >
            {results.map((f, idx) => {
              const active = idx === highlighted;
              const id = f.id ? `option-${f.id}` : `option-${idx}`;
              return (
                <li
                  id={id}
                  key={id}
                  role="option"
                  aria-selected={active}
                  onMouseEnter={() => setHighlighted(idx)}
                  onMouseDown={(e) => e.preventDefault()} // keep input focus
                  onClick={() => handleSelect(f)}
                  className={`cursor-pointer px-3 py-2 text-sm ${
                    active ? "bg-indigo-50" : "bg-white"
                  } hover:bg-indigo-50`}
                >
                  <div className="font-medium">
                    {f.text ?? f.place_name ?? "Adresse"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {f.place_name ?? ""}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Tapez pour chercher votre adresse puis sélectionnez une suggestion.
      </p>
    </div>
  );
}
