import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function Merchants() {

  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const deleteMerchant = async (id) => {

    if (!window.confirm("Delete this merchant?")) return;

    try {

      await api.delete(`/admin/merchants/${id}`);

      setMerchants(prev =>
        prev.filter(m => m._id !== id)
      );

    } catch (error) {

      console.error(error);

    }

  };

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

  if (loading) {

    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );

  }

  return (
    <div>

      <div className="flex justify-between mb-6">

        <h1 className="text-2xl font-bold">
          Merchants
        </h1>

        <Link
          to="/merchants/create"
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
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

              <span
                className={`px-2 py-1 rounded text-sm ${
                  merchant.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {merchant.isActive ? "Active" : "Disabled"}
              </span>

            </div>

            <div className="space-x-2">

              <button
                onClick={() => toggleMerchant(merchant._id)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
              >
                Toggle
              </button>

              <button
                onClick={() => deleteMerchant(merchant._id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                Delete
              </button>

              <Link
                to={`/products?merchant=${merchant._id}`}
                className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded"
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