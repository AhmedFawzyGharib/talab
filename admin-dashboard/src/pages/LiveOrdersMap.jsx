import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../services/api";

export default function LiveOrdersMap() {

  const [orders, setOrders] = useState([]);

  useEffect(() => {

    let interval;

    const loadOrders = async () => {

      try {

        const res = await api.get("/admin/orders");

        const activeOrders = res.data.filter(order =>
          ["accepted", "picked", "on_the_way"].includes(order.status)
        );

        setOrders(activeOrders);

      } catch (error) {

        console.error("Orders fetch error:", error);

      }

    };

    loadOrders();

    interval = setInterval(loadOrders, 5000);

    return () => clearInterval(interval);

  }, []);

  return (

    <div>

      <h1 className="text-2xl font-bold mb-4">
        Live Orders Map
      </h1>

      <MapContainer
        center={[30.0444, 31.2357]}
        zoom={12}
        style={{ height: "600px", width: "100%" }}
      >

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {orders.map(order => {

          const lat =
            order.deliveryLocation?.coordinates?.[1];

          const lng =
            order.deliveryLocation?.coordinates?.[0];

          if (!lat || !lng) return null;

          return (

            <Marker
              key={order._id}
              position={[lat, lng]}
              icon={L.icon({
                iconUrl:
                  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                iconSize: [25, 41]
              })}
            >

              <Popup>

                <b>Order #{order._id.slice(-6)}</b>

                <br />

                Status: {order.status}

                <br />

                Customer: {order.customer?.name}

              </Popup>

            </Marker>

          );

        })}

      </MapContainer>

    </div>

  );

}