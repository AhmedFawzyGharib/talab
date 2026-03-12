import React from "react";

export default function OrderModal({ order, onClose }) {

  if (!order) return null;

  return (

    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">

      <div className="bg-white w-[600px] p-6 rounded shadow">

        <h2 className="text-xl font-bold mb-4">

          Order Details

        </h2>

        <p>

          <b>Order ID:</b> {order._id}

        </p>

        <p>

          <b>Type:</b> {order.type}

        </p>

        <p>

          <b>Status:</b> {order.status}

        </p>

        <p>

          <b>Customer:</b> {order.customer?.name}

        </p>

        <p>

          <b>Driver:</b> {order.driver?.name || "Not assigned"}

        </p>

        <p>

          <b>Total:</b> ${order.totalPrice}

        </p>

        <p>

          <b>Address:</b> {order.deliveryAddress}

        </p>

        <hr className="my-4" />

        <h3 className="font-bold mb-2">

          Order Timeline

        </h3>

        {order.timeline?.map((t, i) => (

          <div key={i} className="text-sm text-gray-600">

            {t.status} — {new Date(t.time).toLocaleString()}

          </div>

        ))}

        <button

          onClick={onClose}

          className="mt-6 bg-red-500 text-white px-4 py-2 rounded"

        >

          Close

        </button>

      </div>

    </div>

  );

}