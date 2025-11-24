import { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface Props {
  value?: { lat: number; lng: number };
  onChange: (data: { lat: number; lng: number; address: string }) => void;
}

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

function ClickHandler({ onSelect }: { onSelect: Props['onChange'] }) {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=tr`
      );
      const json = await res.json();
      const address = json.display_name;
      onSelect({ lat, lng, address });
    }
  });
  return null;
}

export default function MapSelector({ value, onChange }: Props) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(value || null);

  useEffect(() => {
    if (value) setPosition(value);
  }, [value]);

  const handleSelect = (data: { lat: number; lng: number; address: string }) => {
    setPosition({ lat: data.lat, lng: data.lng });
    onChange(data);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
      <MapContainer center={position || { lat: 39.0, lng: 35.0 }} zoom={6} scrollWheelZoom className="h-64">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
        <ClickHandler onSelect={handleSelect} />
        {position && <Marker position={position} icon={markerIcon} />}
      </MapContainer>
    </div>
  );
}
