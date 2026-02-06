"use client";

import { useEffect, useRef, useState } from "react";
import { Map, MapMarker, MapPolyline } from "@/components/ui/map";

interface LiveTrackingMapProps {
  origin: [number, number];
  destination: [number, number];
  currentLocation?: [number, number] | null;
  status: string;
  className?: string;
}

export function LiveTrackingMap({
  origin,
  destination,
  currentLocation,
  status,
  className,
}: LiveTrackingMapProps) {
  const [animatedPosition, setAnimatedPosition] = useState<[number, number]>(origin);
  const animationFrameRef = useRef<number | null>(null);

  // Debug: Log status
  useEffect(() => {
    const normalizedStatus = String(status || "").toLowerCase();
    console.log("LiveTrackingMap - Status:", status, "Normalized:", normalizedStatus, "Is Delivered:", normalizedStatus === "delivered");
  }, [status]);

  // Calculate center point for map
  const mapCenter: [number, number] = currentLocation || [
    (origin[0] + destination[0]) / 2,
    (origin[1] + destination[1]) / 2,
  ];

  // Calculate zoom level based on distance
  const calculateZoom = (): number => {
    const latDiff = Math.abs(origin[0] - destination[0]);
    const lngDiff = Math.abs(origin[1] - destination[1]);
    const maxDiff = Math.max(latDiff, lngDiff);
    
    if (maxDiff > 5) return 5;
    if (maxDiff > 2) return 6;
    if (maxDiff > 1) return 7;
    if (maxDiff > 0.5) return 8;
    if (maxDiff > 0.2) return 9;
    return 10;
  };


  // Animate truck movement
  useEffect(() => {
    const normalizedStatus = String(status || "").toLowerCase().trim();
    console.log("LiveTrackingMap - Animate effect - Status:", status, "Normalized:", normalizedStatus, "Is Delivered:", normalizedStatus === "delivered");
    
    if (normalizedStatus === "delivered") {
      // When delivered, show final position at destination
      console.log("Setting position to destination (delivered)");
      setAnimatedPosition(destination);
      return;
    }
    
    if (normalizedStatus === "pending") {
      // When pending, show at origin
      console.log("Setting position to origin (pending)");
      setAnimatedPosition(origin);
      return;
    }

    const targetPosition = currentLocation || destination;
    const startPosition = animatedPosition;
    
    const distance = Math.sqrt(
      Math.pow(targetPosition[0] - startPosition[0], 2) +
      Math.pow(targetPosition[1] - startPosition[1], 2)
    );

    if (distance < 0.001) {
      setAnimatedPosition(targetPosition);
      return;
    }

    const duration = 2000; // 2 seconds
    const startTime = Date.now();
    const startLat = startPosition[0];
    const startLng = startPosition[1];
    const endLat = targetPosition[0];
    const endLng = targetPosition[1];

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-in-out)
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      const currentLat = startLat + (endLat - startLat) * eased;
      const currentLng = startLng + (endLng - startLng) * eased;

      setAnimatedPosition([currentLat, currentLng]);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentLocation, status]);

  // Create custom truck icon
  const createTruckIcon = () => {
    if (typeof window === "undefined" || !(window as any).L) return null;

    const L = (window as any).L;
    return L.divIcon({
      className: "truck-marker",
      html: `
        <div style="
          position: relative;
          width: 40px;
          height: 40px;
          background: #3b82f6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          border: 3px solid white;
        ">
          <div style="
            position: absolute;
            width: 100%;
            height: 100%;
            background: rgba(59, 130, 246, 0.2);
            border-radius: 50%;
            animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
          </svg>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  };

  // Create delivered icon (green checkmark)
  const createDeliveredIcon = () => {
    if (typeof window === "undefined" || !(window as any).L) return null;

    const L = (window as any).L;
    return L.divIcon({
      className: "delivered-marker",
      html: `
        <div style="
          position: relative;
          width: 48px;
          height: 48px;
          background: #10b981;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.5);
          border: 3px solid white;
        ">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });
  };

  return (
    <div className={className}>
      <Map center={mapCenter} zoom={calculateZoom()}>
        {/* Route Polyline - Green when delivered */}
        {(() => {
          const normalizedStatus = String(status || "").toLowerCase();
          const isDelivered = normalizedStatus === "delivered";
          return (
            <MapPolyline
              positions={[origin, destination]}
              color={isDelivered ? "#10b981" : "#3b82f6"}
              weight={4}
              opacity={isDelivered ? 0.8 : 0.6}
              dashArray={isDelivered ? undefined : "10, 10"}
            />
          );
        })()}
        
        {/* Origin Marker */}
        <MapMarker
          position={origin}
          title="Satıcı Konumu"
          popup="Sipariş buradan gönderildi"
        />

        {/* Destination Marker - Hide when delivered (we show delivered marker instead) */}
        {(() => {
          const normalizedStatus = String(status || "").toLowerCase();
          return normalizedStatus !== "delivered" && (
            <MapMarker
              position={destination}
              title="Teslimat Adresi"
              popup="Paket buraya teslim edilecek"
            />
          );
        })()}

        {/* Moving Truck Marker - Show when in transit */}
        {(() => {
          const normalizedStatus = String(status || "").toLowerCase();
          return normalizedStatus !== "delivered" && 
                 normalizedStatus !== "pending" && 
                 normalizedStatus !== "cancelled" && (
            <MapMarker
              position={animatedPosition}
              title="Kargo Aracı"
              popup="Paket bu konumda"
              icon={createTruckIcon()}
            />
          );
        })()}
        
        {/* Delivered Marker - Show checkmark when delivered */}
        {(() => {
          const normalizedStatus = String(status || "").toLowerCase();
          if (normalizedStatus === "delivered") {
            return (
              <MapMarker
                position={destination}
                title="Teslim Edildi ✓"
                popup={(() => {
                  const deliveryDate = new Date().toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  });
                  const deliveryTime = new Date().toLocaleTimeString("tr-TR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return `
                    <div style="text-align: center; padding: 12px; min-width: 200px;">
                      <div style="margin-bottom: 12px;">
                        <div style="width: 48px; height: 48px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px;">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                        </div>
                      </div>
                      <h3 style="margin: 0 0 8px 0; color: #10b981; font-weight: bold; font-size: 18px;">
                        🎉 Sipariş Ulaştı!
                      </h3>
                      <p style="margin: 0 0 4px 0; color: #666; font-size: 14px; line-height: 1.5;">
                        Paketiniz başarıyla teslim edildi
                      </p>
                      <p style="margin: 8px 0 0 0; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 8px;">
                        ${deliveryDate} - ${deliveryTime}
                      </p>
                    </div>
                  `;
                })()}
                icon={createDeliveredIcon()}
              />
            );
          }
          return null;
        })()}
      </Map>

      <style jsx>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
