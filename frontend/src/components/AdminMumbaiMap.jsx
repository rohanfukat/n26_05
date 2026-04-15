import React, { useState } from 'react';
import { MapContainer, TileLayer, Circle, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Mumbai regions with approximate coordinates and sample data
const mumbaiRegions = [
  { name: 'Vashi', lat: 19.0771, lng: 72.9986, complaints: 45 },
  { name: 'Panvel', lat: 18.9894, lng: 73.1175, complaints: 32 },
  { name: 'Andheri', lat: 19.1197, lng: 72.8464, complaints: 78 },
  { name: 'Borivali', lat: 19.2294, lng: 72.8574, complaints: 56 },
  { name: 'Bandra', lat: 19.0596, lng: 72.8295, complaints: 67 },
  { name: 'Dadar', lat: 19.0178, lng: 72.8478, complaints: 89 },
  { name: 'Kurla', lat: 19.0647, lng: 72.8807, complaints: 43 },
  { name: 'Chembur', lat: 19.0622, lng: 72.9026, complaints: 52 },
  { name: 'Thane', lat: 19.2183, lng: 72.9781, complaints: 71 },
  { name: 'Navi Mumbai', lat: 19.0330, lng: 73.0297, complaints: 38 },
  { name: 'Colaba', lat: 18.9067, lng: 72.8147, complaints: 29 },
  { name: 'Powai', lat: 19.1176, lng: 72.9057, complaints: 64 },
  { name: 'Nerul', lat: 19.0330, lng: 73.0297, complaints: 41 },
  { name: 'Kharghar', lat: 19.0343, lng: 73.0597, complaints: 35 },
  { name: 'Airoli', lat: 19.1500, lng: 72.9833, complaints: 28 },
  { name: 'Mulund', lat: 19.1861, lng: 72.9461, complaints: 59 },
  { name: 'Kandivali', lat: 19.2041, lng: 72.8681, complaints: 47 },
  { name: 'Malad', lat: 19.1861, lng: 72.8481, complaints: 53 },
];

// Component to handle map interactions
function MapController({ selectedRegion }) {
  const map = useMap();

  React.useEffect(() => {
    if (selectedRegion) {
      map.setView([selectedRegion.lat, selectedRegion.lng], 12);
    }
  }, [selectedRegion, map]);

  return null;
}

const AdminMumbaiMap = () => {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [hoveredRegion, setHoveredRegion] = useState(null);

  const handleRegionClick = (region) => {
    setSelectedRegion(region);
  };

  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={[19.0760, 72.8777]} // Mumbai center
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {mumbaiRegions.map((region, index) => (
          <Circle
            key={index}
            center={[region.lat, region.lng]}
            radius={2000} // 2km radius
            pathOptions={{
              color: hoveredRegion === region.name ? '#8b5cf6' : '#3b82f6',
              fillColor: hoveredRegion === region.name ? '#a855f7' : '#60a5fa',
              fillOpacity: 0.3,
              weight: 2,
              dashArray: '5, 5',
            }}
            eventHandlers={{
              click: () => handleRegionClick(region),
              mouseover: () => setHoveredRegion(region.name),
              mouseout: () => setHoveredRegion(null),
            }}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-bold text-lg">{region.name}</h3>
                <p className="text-sm text-gray-600">Complaints: {region.complaints}</p>
                <p className="text-xs text-gray-500 mt-1">Future: Backend API integration</p>
              </div>
            </Popup>
          </Circle>
        ))}
        <MapController selectedRegion={selectedRegion} />
      </MapContainer>
    </div>
  );
};

export default AdminMumbaiMap;