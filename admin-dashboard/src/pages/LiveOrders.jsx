import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function LiveOrders() {

  const [orders, setOrders] = useState([]);

  useEffect(() => {

    const fetchOrders = async () => {

      try {

        const res = await api.get("/admin/orders");

        setOrders(res.data);

      } catch (error) {

        console.error(error);

      }

    };

    fetchOrders();

    const interval = setInterval(fetchOrders, 5000);

    return () => clearInterval(interval);

  }, []);

  return (

    <div>

      <h1 className="text-2xl font-bold mb-6">
        Live Orders
      </h1>

      {orders.map(order => (

        <div
          key={order._id}
          className="p-4 border-b bg-white rounded mb-3 shadow"
        >

          <div className="flex justify-between">

            <div>

              <p className="font-semibold">
                Order #{order._id.slice(-6)}
              </p>

              <p>
                Customer: {order.customer?.name}
              </p>

              <p>
                Total: ${order.totalPrice}
              </p>

            </div>

            <span
              className={`px-2 py-1 rounded text-sm ${
                order.status === "delivered"
                  ? "bg-green-100 text-green-700"
                  : order.status === "cancelled"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {order.status}
            </span>

          </div>

        </div>

      ))}

    </div>

  );

}