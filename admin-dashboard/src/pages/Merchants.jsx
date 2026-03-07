import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function Merchants() {

  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);

  // ===============================
  // Fetch Merchants
  // ===============================
  useEffect(() => {

    const fetchMerchants = async () => {

      try {

        const res = await api.get("/admin/merchants");

        setMerchants(res.data);

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);

      }

    };

    fetchMerchants();

  }, []);

  // ===============================
  // Delete Merchant
  // ===============================
  const deleteMerchant = async (id) => {

    try {

      await api.delete(`/admin/merchants/${id}`);

      setMerchants(prev =>
        prev.filter(m => m._id !== id)
      );

    } catch (error) {

      console.error(error);

    }

  };

  // ===============================
  // Toggle Merchant
  // ===============================
  const toggleMerchant = async (id) => {

    try {

      const res = await api.patch(`/admin/merchants/${id}/toggle`);

      setMerchants(prev =>
        prev.map(m =>
          m._id === id ? res.data : m
        )
      );

    } catch (error) {

      console.error(error);

    }

  };

  if (loading) return <p>Loading merchants...</p>;

  return (
    <div>

      <div className="flex justify-between mb-6">

        <h1 className="text-2xl font-bold">
          Merchants
        </h1>

        <Link
          to="/merchants/create"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Create Merchant
        </Link>

      </div>

      {merchants.map(merchant => (

        <div
          key={merchant._id}
          className="p-4 border-b bg-white rounded mb-3 shadow"
        >

          <div className="flex justify-between items-center">

            <div>

              <p className="font-semibold text-lg">
                {merchant.name}
              </p>

              <p>
                Phone: {merchant.user?.phone}
              </p>

              <p>
                Type: {merchant.type}
              </p>

              <p>
                Status:
                {merchant.isActive
                  ? " Active"
                  : " Disabled"}
              </p>

            </div>

            <div className="space-x-2">

              <button
                onClick={() => toggleMerchant(merchant._id)}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Toggle
              </button>

              <button
                onClick={() => deleteMerchant(merchant._id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>

              <Link
                to={`/products?merchant=${merchant._id}`}
                className="bg-purple-500 text-white px-3 py-1 rounded"
              >
                Products
              </Link>

            </div>

          </div>

        </div>

      ))}

    </div>
  );
}