import React, { useEffect, useState } from "react";
import api from "../services/api";
import OrderModal from "../components/OrderModal";
import AssignDriverModal from "../components/AssignDriverModal";

export default function AdminOrders() {

  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [assignOrder, setAssignOrder] = useState(null);

  const fetchOrders = async () => {

    try {

      const res = await api.get("/admin/orders");

      setOrders(res.data);

    } catch (error) {

      console.error("Orders error:", error);

    }

  };

  useEffect(() => {

    const load = async () => {
      await fetchOrders();
    };

    load();

  }, []);

  const cancelOrder = async (id) => {

    if (!window.confirm("Cancel order?")) return;

    try {

      await api.patch(`/admin/orders/${id}/cancel`);

      fetchOrders();

    } catch (error) {

      console.error(error);

    }

  };

  return (

    <div>

      <h1 className="text-3xl font-bold mb-6">
        Orders
      </h1>

      <div className="bg-white rounded-xl shadow">

        {orders.length === 0 && (

          <div className="p-6 text-center text-gray-500">
            No orders found
          </div>

        )}

        {orders.map(order => (

          <div
            key={order._id}
            className="p-4 border-b flex justify-between items-center"
          >

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

              <p className="text-sm text-gray-500">
                Type: {order.type}
              </p>

              <span
                className={`text-xs px-2 py-1 rounded ${
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

            <div className="space-x-2">

              <button
                onClick={() => setSelected(order)}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Details
              </button>

              <button
                onClick={() => setAssignOrder(order)}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Assign Driver
              </button>

              {order.status !== "cancelled" && (

                <button
                  onClick={() => cancelOrder(order._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Cancel
                </button>

              )}

            </div>

          </div>

        ))}

      </div>

      <OrderModal
        order={selected}
        onClose={() => setSelected(null)}
      />

      <AssignDriverModal
        order={assignOrder}
        onClose={() => setAssignOrder(null)}
        onAssigned={fetchOrders}
      />

    </div>

  );

}