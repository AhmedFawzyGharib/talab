import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import api from "../services/api";

export default function DriversHeatMap() {

  const [drivers, setDrivers] = useState([]);

  const mapRef = useRef();

  useEffect(() => {

    const fetchDrivers = async () => {

      try {

        const res = await api.get("/admin/drivers");

        setDrivers(res.data);

      } catch (error) {

        console.error(error);

      }

    };

    fetchDrivers();

  }, []);

  useEffect(() => {

    if (!mapRef.current) return;

    const map = mapRef.current;

    const points = drivers
      .filter(d => d.currentLocation)
      .map(d => [

        d.currentLocation.coordinates[1],
        d.currentLocation.coordinates[0],
        0.5

      ]);

    if (points.length === 0) return;

    L.heatLayer(points, {
      radius: 25,
      blur: 15
    }).addTo(map);

  }, [drivers]);

  return (

    <div>

      <h1 className="text-2xl font-bold mb-4">
        Driver Heat Map
      </h1>

      <MapContainer
        center={[30.0444, 31.2357]}
        zoom={12}
        style={{ height: "600px" }}
        whenCreated={(map) => (mapRef.current = map)}
      >

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

      </MapContainer>

    </div>

  );

}