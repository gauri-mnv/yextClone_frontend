"use client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo } from "react";
import { Business } from "@/types/business";

// Custom Marker Icon
// const icon = L.icon({
//   iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
// });

// --- 1. Custom Google-style Red Pin Symbol ---
const googleMarkerIcon = L.divIcon({
  html: `
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-9-7-9z" fill="#EA4335" stroke="#B31412" stroke-width="1"/>
      <circle cx="12" cy="9" r="3" fill="white"/>
    </svg>
  `,
  className: "",
  iconSize: [30, 30],
  iconAnchor: [15, 30], // Pin ki nook niche honi chahiye
  popupAnchor: [0, -30],
});

// Helper: URL se coordinates nikalne ke liye regex
const getCoordsFromUrl = (url: string): [number, number] | null => {
  if (!url) return null;
  const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match) return [parseFloat(match[1]), parseFloat(match[2])];
  return null;
};

// --- Auto-Zoom Logic Component ---
function SetBounds({ markers }: { markers: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 0) {
      // L.latLngBounds saari locations ko ek "box" mein wrap karta hai
      const bounds = L.latLngBounds(markers);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [markers, map]);
  return null;
}

export default function Map({ businesses }: { businesses: Business[] }) {
  // 1. Saare businesses ke valid coordinates nikalna
  const validMarkers = useMemo(() => {
    return businesses
      .map((bus) => {
        const coords = (Number(bus.lat) && Number(bus.lng))
          ? [Number(bus.lat), Number(bus.lng)] as [number, number]
          : getCoordsFromUrl(bus.locationLink || "");
        
        return { ...bus, coords };
      })
      .filter((m) => m.coords !== null);
  }, [businesses]);

  // 2. Sirf coordinates ka array (Bounds ke liye)
  const allCoords = validMarkers.map((m) => m.coords!);

  // Unique key taaki map fresh render ho jab data change ho
  // const mapKey = `map-v2-${businesses.length}`;
  const mapKey = `google-map-${businesses.length}`;

  return (
    <div style={{ height: "400px", width: "100%", borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer
        key={mapKey}
        center={[23.0225, 72.5714]} // Default Ahmedabad
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        {/* <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        /> */}
        {/* --- 2. Google Maps Street View Tiles --- */}
        <TileLayer
          url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
          attribution='&copy; Google Maps'
        />

        {/* Yeh component map ko saari pins dikhane ke liye auto-adjust karega */}
        {allCoords.length > 0 && <SetBounds markers={allCoords} />}

        {validMarkers.map((bus) => (
          <Marker 
            key={bus.id} 
            position={bus.coords!} 
            icon={googleMarkerIcon}
          >
            <Popup>
              <div style={{ minWidth: '150px' ,textAlign: 'center' }}>
                <strong style={{ color: '#298a87' }}>{bus.name}</strong>
                <p style={{ fontSize: '12px', margin: '5px 0' }}>{bus.address}</p>
                <a href={bus.locationLink} target="_blank" style={{ fontSize: '11px', color: 'blue' }}>
                  View on Google Maps
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}