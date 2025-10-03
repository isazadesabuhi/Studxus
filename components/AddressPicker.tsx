"use client";

import { useEffect, useRef, useState } from "react";
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
  initialAddress?: string;
}

export default function AddressPicker({
  onAddressSelect,
  initialAddress,
}: AddressPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

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
      center: [2.3522, 48.8566], // Paris default
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
      mapboxgl: mapboxgl,
      marker: false,
      placeholder: "Search for your address...",
    });

    map.current.addControl(geocoder);
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Handle geocoder result
    geocoder.on("result", (e) => {
      const result = e.result;
      const coordinates = result.geometry.coordinates;

      // Extract address components
      const addressData = parseGeocoderResult(result);

      // Update marker position
      if (marker.current && map.current) {
        marker.current.setLngLat(coordinates).addTo(map.current);
      }

      // Notify parent component
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
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat.lng},${lngLat.lat}.json?access_token=${mapboxToken}`
          );
          const data = await response.json();

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

    map.current.on("load", () => {
      setMapLoaded(true);
    });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [onAddressSelect]);

  // Helper function to parse geocoder results
  const parseGeocoderResult = (
    result: any
  ): Omit<AddressData, "latitude" | "longitude"> => {
    let address = result.place_name || "";
    let city = "";
    let country = "";
    let postalCode = "";

    // Extract components from context
    if (result.context) {
      result.context.forEach((item: any) => {
        if (item.id.startsWith("place")) {
          city = item.text;
        } else if (item.id.startsWith("country")) {
          country = item.text;
        } else if (item.id.startsWith("postcode")) {
          postalCode = item.text;
        }
      });
    }

    // Try to get address from text field
    if (result.text) {
      address = result.place_name || result.text;
    }

    return {
      address,
      city,
      country,
      postalCode,
    };
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
