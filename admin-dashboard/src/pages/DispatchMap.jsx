import React, { useEffect, useState } from "react";
import api from "../services/api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function DispatchMap() {

  const [drivers, setDrivers] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {

    const fetchData = async () => {

      try {

        const driversRes = await api.get("/admin/drivers");
        const ordersRes = await api.get("/admin/orders");

        setDrivers(driversRes.data);
        setOrders(ordersRes.data);

      } catch (error) {

        console.error(error);

      }

    };

    fetchData();

    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);

  }, []);

  return (

    <div>

      <h1 className="text-2xl font-bold mb-6">
        Dispatch Map
      </h1>

      <MapContainer
        center={[30.0444, 31.2357]}
        zoom={12}
        style={{ height: "600px" }}
      >

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Drivers */}

        {drivers.map(driver => {

          if (!driver.currentLocation) return null;

          const [lng, lat] =
            driver.currentLocation.coordinates;

          return (

            <Marker
              key={driver._id}
              position={[lat, lng]}
            >

              <Popup>

                <b>Driver</b>

                <br />

                {driver.userId?.name}

                <br />

                Phone: {driver.userId?.phone}

              </Popup>

            </Marker>

          );

        })}

        {/* Orders */}

        {orders.map(order => {

          if (!order.deliveryLocation) return null;

          const [lng, lat] =
            order.deliveryLocation.coordinates;

          return (

            <Marker
              key={order._id}
              position={[lat, lng]}
            >

              <Popup>

                <b>Order</b>

                <br />

                Customer: {order.customer?.name}

                <br />

                Total: ${order.totalPrice}

                <br />

                Status: {order.status}

              </Popup>

            </Marker>

          );

        })}

      </MapContainer>

    </div>

  );

}