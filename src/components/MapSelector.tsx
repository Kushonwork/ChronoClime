import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapSelectorProps {
  initialLocation: string;
  onLocationSelect: (location: string) => void;
}

function LocationMarker({ onPositionChange }: { onPositionChange: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<LatLngExpression>([20.5937, 78.9629]);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return <Marker position={position} />;
}

export default function MapSelector({ initialLocation, onLocationSelect }: MapSelectorProps) {
  const [searchQuery, setSearchQuery] = useState(initialLocation);
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number }>({
    lat: 20.5937,
    lng: 78.9629,
  });

  const handlePositionChange = (lat: number, lng: number) => {
    setSelectedPosition({ lat, lng });
  };

  const handleConfirm = () => {
    const locationName = searchQuery || `${selectedPosition.lat.toFixed(4)}, ${selectedPosition.lng.toFixed(4)}`;
    onLocationSelect(locationName);
  };

  return (
    <div className="flex flex-col h-[600px]">
      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search location or click on map"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-peacock focus:outline-none mb-3"
        />
        <p className="text-sm text-gray-600">
          Click anywhere on the map to select a location
        </p>
      </div>

      <div className="flex-1 relative">
        <MapContainer
          center={[selectedPosition.lat, selectedPosition.lng]}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker onPositionChange={handlePositionChange} />
        </MapContainer>
      </div>

      <div className="p-4 border-t border-gray-200 flex gap-3 justify-end">
        <button
          onClick={handleConfirm}
          className="liquid-button px-8 py-3"
        >
          Confirm Location
        </button>
      </div>
    </div>
  );
}
