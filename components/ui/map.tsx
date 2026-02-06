"use client";

import { useEffect, useRef, createContext, useContext, useState } from "react";

// Type definitions
type LatLngExpression = [number, number] | { lat: number; lng: number };

// Load Leaflet from CDN
const loadLeaflet = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Window is not defined"));
      return;
    }

    // Check if already loaded
    if ((window as any).L) {
      resolve((window as any).L);
      return;
    }

    // Load CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.integrity =
      "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    link.crossOrigin = "";
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement("script");
    script.src =
      "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.integrity =
      "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    script.crossOrigin = "";
    script.onload = () => {
      const L = (window as any).L;

      // Fix for default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      resolve(L);
    };
    script.onerror = () => reject(new Error("Failed to load Leaflet"));
    document.head.appendChild(script);
  });
};

const MapContext = createContext<{ map: any } | null>(null);

interface MapProps {
  center: LatLngExpression;
  zoom: number;
  children?: React.ReactNode;
  className?: string;
}

export function Map({ center, zoom, children, className }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    loadLeaflet()
      .then((L) => {
        if (mapInstanceRef.current) {
          setLeafletLoaded(true);
          setMapInstance(mapInstanceRef.current);
          return;
        }

        // Convert center to [lat, lng] format
        const centerCoords: [number, number] =
          Array.isArray(center) ? center : [center.lat, center.lng];

        // Initialize map
        const map = L.map(mapRef.current!).setView(centerCoords, zoom);
        mapInstanceRef.current = map;
        setMapInstance(map);

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        setLeafletLoaded(true);
      })
      .catch((error) => {
        console.error("Failed to load Leaflet:", error);
      });

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          // Ignore cleanup errors
        }
        mapInstanceRef.current = null;
        setMapInstance(null);
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstance && leafletLoaded) {
      try {
        const centerCoords: [number, number] =
          Array.isArray(center) ? center : [center.lat, center.lng];
        mapInstance.setView(centerCoords, zoom);
      } catch (error) {
        console.error("Error setting map view:", error);
      }
    }
  }, [center, zoom, leafletLoaded, mapInstance]);

  return (
    <MapContext.Provider value={{ map: mapInstance }}>
      <div
        ref={mapRef}
        className={className || "w-full h-[400px] rounded-lg overflow-hidden"}
        style={{ zIndex: 0 }}
      >
        {mapInstance && children}
      </div>
    </MapContext.Provider>
  );
}

interface MapTileLayerProps {
  url?: string;
  attribution?: string;
}

export function MapTileLayer({
  url = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}: MapTileLayerProps) {
  // This is handled in Map component, but kept for API compatibility
  return null;
}

interface MapMarkerProps {
  position: LatLngExpression;
  title?: string;
  popup?: string | React.ReactNode;
  icon?: any;
}

export function MapMarker({ position, title, popup, icon }: MapMarkerProps) {
  const context = useContext(MapContext);
  const markerRef = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const setupMarker = async () => {
      try {
        const L = await loadLeaflet();
        setLeafletLoaded(true);

        // Wait for map to be ready
        if (!context?.map) {
          // Retry after a short delay
          setTimeout(() => {
            if (context?.map) {
              setupMarker();
            }
          }, 100);
          return;
        }

        // Remove existing marker
        if (markerRef.current && context.map) {
          try {
            context.map.removeLayer(markerRef.current);
          } catch (e) {
            // Ignore if already removed
          }
        }

        // Convert position to [lat, lng] format
        const positionCoords: [number, number] =
          Array.isArray(position) ? position : [position.lat, position.lng];

        // Only pass icon if it's defined
        const markerOptions: any = {};
        if (icon) {
          markerOptions.icon = icon;
        }

        const marker = L.marker(positionCoords, markerOptions).addTo(context.map);
        markerRef.current = marker;

        if (title) {
          marker.bindTooltip(title);
        }

        if (popup) {
          if (typeof popup === "string") {
            marker.bindPopup(popup, {
              className: "custom-popup",
              maxWidth: 250,
            });
            // Auto-open popup if it contains "ulaştı" or "teslim" or "Sipariş"
            const popupLower = popup.toLowerCase();
            if (popupLower.includes("ulaştı") || 
                popupLower.includes("teslim") || 
                popupLower.includes("sipariş")) {
              // Delay to ensure map is fully loaded
              setTimeout(() => {
                try {
                  marker.openPopup();
                } catch (e) {
                  console.error("Error opening popup:", e);
                }
              }, 500);
            }
          } else {
            const popupContent = document.createElement("div");
            marker.bindPopup(popupContent);
          }
        }
      } catch (error) {
        console.error("Failed to load Leaflet for marker:", error);
      }
    };

    setupMarker();

    return () => {
      if (markerRef.current && context?.map) {
        try {
          context.map.removeLayer(markerRef.current);
        } catch (e) {
          // Ignore if already removed
        }
      }
    };
  }, [position, title, popup, icon, context]);

  return null;
}

interface MapPolylineProps {
  positions: LatLngExpression[];
  color?: string;
  weight?: number;
  opacity?: number;
  dashArray?: string;
}

export function MapPolyline({
  positions,
  color = "#3b82f6",
  weight = 4,
  opacity = 0.6,
  dashArray,
}: MapPolylineProps) {
  const context = useContext(MapContext);
  const polylineRef = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const setupPolyline = async () => {
      try {
        const L = await loadLeaflet();
        setLeafletLoaded(true);

        // Wait for map to be ready
        if (!context?.map) {
          // Retry after a short delay
          setTimeout(() => {
            if (context?.map) {
              setupPolyline();
            }
          }, 100);
          return;
        }

        // Remove existing polyline
        if (polylineRef.current && context.map) {
          try {
            context.map.removeLayer(polylineRef.current);
          } catch (e) {
            // Ignore if already removed
          }
        }

        // Convert positions to [lat, lng][] format
        const coords = positions.map((pos) =>
          Array.isArray(pos) ? pos : [pos.lat, pos.lng]
        );

        if (coords.length < 2) return;

        const options: any = { color, weight, opacity };
        if (dashArray) {
          options.dashArray = dashArray;
        }

        const polyline = L.polyline(coords, options).addTo(context.map);
        polylineRef.current = polyline;

        // Fit map to polyline bounds
        try {
          context.map.fitBounds(polyline.getBounds());
        } catch (e) {
          console.error("Error fitting bounds:", e);
        }
      } catch (error) {
        console.error("Failed to load Leaflet for polyline:", error);
      }
    };

    setupPolyline();

    return () => {
      if (polylineRef.current && context?.map) {
        try {
          context.map.removeLayer(polylineRef.current);
        } catch (e) {
          // Ignore if already removed
        }
      }
    };
  }, [positions, color, weight, opacity, dashArray, context]);

  return null;
}

