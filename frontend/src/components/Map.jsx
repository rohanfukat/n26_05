import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Map = ({ hotspots }) => {
  // Default center (India)
  const center = [20.5937, 78.9629];

  return (
    <div id="map" style={{ height: '400px', width: '100%' }}>
      <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {hotspots.map((hotspot, index) => (
          <Marker key={index} position={[20.5937 + Math.random() * 10 - 5, 78.9629 + Math.random() * 10 - 5]}>
            <Popup>
              <div>
                <h3>{hotspot.location || hotspot.pinCode}</h3>
                <p>Total complaints: {hotspot.count}</p>
                <p>Critical: {hotspot.critical}, High: {hotspot.high}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;