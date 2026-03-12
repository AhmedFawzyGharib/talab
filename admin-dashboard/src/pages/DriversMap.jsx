import React from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { useSearchParams } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function DriversMap() {

  const [params] = useSearchParams();

  const lat = parseFloat(params.get("lat")) || 30.0444;
  const lng = parseFloat(params.get("lng")) || 31.2357;

  const position = [lat, lng];

  return (

    <div>

      <h1 className="text-3xl font-bold mb-6">
        Driver Location
      </h1>

      <MapContainer
        center={position}
        zoom={14}
        style={{ height: "600px", width: "100%" }}
      >

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker
          position={position}
          icon={L.icon({
            iconUrl:
              "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            iconSize: [25, 41]
          })}
        />

      </MapContainer>

    </div>

  );

}