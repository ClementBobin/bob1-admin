"use client";

import { useEffect, useRef } from "react";

/** Leaflet map geocoding the given address (Nominatim). */
export function MapPreview({ address, city, postalCode }: { address: string; city: string; postalCode: string }) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    // Dynamic import to avoid SSR issues
    import("leaflet").then((L) => {
      if (cancelled || !mapContainerRef.current) return;

      import("leaflet/dist/leaflet.css").catch(() => {});

      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const newMap = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
      } as L.MapOptions).setView([43.6108, 3.8767], 13); // Default to Montpellier

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(newMap);

      // Geocode address using Nominatim
      const fullAddress = `${address}, ${postalCode} ${city}, France`;
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`)
        .then((res) => res.json())
        .then((data) => {
          if (data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            newMap.setView([lat, lon], 15);
            L.marker([lat, lon]).addTo(newMap).bindPopup(`${address}<br>${postalCode} ${city}`).openPopup();
          }
        })
        .catch(() => {
          // Fallback to default location
        });

      mapRef.current = newMap;
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [address, city, postalCode]);

  return (
    <div
      ref={mapContainerRef}
      className="flex h-[200px] flex-col items-center justify-center gap-2 rounded-[13px] bg-[linear-gradient(135deg,var(--muted),color-mix(in_srgb,var(--mint)_60%,var(--muted)))] text-[11px] font-semibold text-mint-foreground"
    >
      <div className="w-full h-full" style={{ minHeight: 200 }} />
    </div>
  );
}
