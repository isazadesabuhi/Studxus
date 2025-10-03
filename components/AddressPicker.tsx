"use client";

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
  place_name?: string;
  text?: string;
  context?: MapboxContextItem[];
  geometry: MapboxGeometry;
}

// Optional: type for the geocoder "result" event payload
interface GeocoderResultEvent {
  result: MapboxGeocodeFeature;
}

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

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
  // initialAddress?: string;
}

export default function AddressPicker({
  onAddressSelect,
}: // initialAddress,
AddressPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  // const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    if (!mapboxToken) {
      console.error("Mapbox token is not configured");
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [4.867652, 45.752195], // Lyon default
      zoom: 12,
    });

    // Initialize marker
    marker.current = new mapboxgl.Marker({
      draggable: true,
      color: "#4F46E5",
    });

    // Add geocoder (search box)
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxToken,
      mapboxgl: mapboxgl as unknown as typeof import("mapbox-gl"),
      marker: false,
      placeholder: "Search for your address...",
    });

    map.current.addControl(geocoder);
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // 1) Strongly type the geocoder event
    geocoder.on("result", (e: GeocoderResultEvent) => {
      const result = e.result;
      const coordinates = result.geometry.coordinates;

      const addressData = parseGeocoderResult(result);

      if (marker.current && map.current) {
        marker.current.setLngLat(coordinates).addTo(map.current);
      }

      onAddressSelect({
        ...addressData,
        latitude: coordinates[1],
        longitude: coordinates[0],
      });
    });

    // Handle marker drag
    if (marker.current) {
      marker.current.on("dragend", async () => {
        if (!marker.current) return;

        const lngLat = marker.current.getLngLat();

        // Reverse geocode to get address
        try {
          // 3) Type the reverse-geocode response before using it
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat.lng},${lngLat.lat}.json?access_token=${mapboxToken}`
          );
          const data: { features?: MapboxGeocodeFeature[] } =
            await response.json();

          if (data.features && data.features.length > 0) {
            const addressData = parseGeocoderResult(data.features[0]);
            onAddressSelect({
              ...addressData,
              latitude: lngLat.lat,
              longitude: lngLat.lng,
            });
          }
        } catch (error) {
          console.error("Error reverse geocoding:", error);
        }
      });
    }

    // map.current.on("load", () => {
    //   setMapLoaded(true);
    // });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [onAddressSelect]);

  // 2) Strongly type the helper (remove 'any')
  const parseGeocoderResult = (
    result: MapboxGeocodeFeature
  ): Omit<AddressData, "latitude" | "longitude"> => {
    let address = result.place_name || "";
    let city = "";
    let country = "";
    let postalCode = "";

    // Extract components from context
    result.context?.forEach((item: MapboxContextItem) => {
      if (item.id.startsWith("place")) {
        city = item.text;
      } else if (item.id.startsWith("country")) {
        country = item.text;
      } else if (item.id.startsWith("postcode")) {
        postalCode = item.text;
      }
    });

    // Prefer place_name (full) but fall back to text (short)
    if (result.text) {
      address = result.place_name || result.text;
    }

    return { address, city, country, postalCode };
  };

  return (
    <div className="w-full space-y-2">
      <label className="block text-sm font-medium text-gray-700">Address</label>
      <div
        ref={mapContainer}
        className="w-full h-[400px] rounded-lg border border-gray-300 overflow-hidden"
      />
      <p className="text-xs text-gray-500">
        Search for your address or drag the marker to adjust the location
      </p>
    </div>
  );
}
