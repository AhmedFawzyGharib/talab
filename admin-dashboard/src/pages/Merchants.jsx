import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { MERCHANT_TYPES, typeBadgeClass } from "../constants/categories";

export default function Merchants() {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    try {
      const res = await api.get("/admin/merchants");
      setMerchants(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMerchant = async (id) => {
    if (!window.confirm("Delete this merchant?")) return;
    try {
      await api.delete(`/admin/merchants/${id}`);
      setMerchants((prev) => prev.filter((m) => m._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const toggleMerchant = async (id) => {
    try {
      const res = await api.patch(`/admin/merchants/${id}/toggle`);
      setMerchants((prev) =>
        prev.map((m) => (m._id === id ? res.data : m))
      );
    } catch (error) {
      console.error(error);
    }
  };

  const filtered = useMemo(() => {
    return merchants.filter((m) => {
      if (typeFilter && m.type !== typeFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        const inName = m.name?.toLowerCase().includes(q);
        const inPhone = m.user?.phone?.includes(query);
        if (!inName && !inPhone) return false;
      }
      return true;
    });
  }, [merchants, query, typeFilter]);

  const typeLabel = (type) =>
    MERCHANT_TYPES.find((t) => t.value === type)?.label || type;

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Merchants</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filtered.length} of {merchants.length} merchants
          </p>
        </div>
        <Link
          to="/merchants/create"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm"
        >
          + Create Merchant
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-5 flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="🔍 Search by name or phone..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 min-w-[200px] border border-gray-200 px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-gray-200 px-4 py-2 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="">All Types</option>
          {MERCHANT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        {(query || typeFilter) && (
          <button
            onClick={() => {
              setQuery("");
              setTypeFilter("");
            }}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No merchants found</p>
            <p className="text-sm mt-1">Try adjusting the filters</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Sub-category
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((merchant) => (
                <tr key={merchant._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-800">
                      {merchant.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {merchant.user?.phone || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold ${typeBadgeClass(
                        merchant.type
                      )}`}
                    >
                      {typeLabel(merchant.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {merchant.subCategory ? (
                      <span className="capitalize">
                        {merchant.subCategory.replace("_", " ")}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                        merchant.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {merchant.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => toggleMerchant(merchant._id)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold"
                    >
                      Toggle
                    </button>
                    <Link
                      to={`/products?merchant=${merchant._id}`}
                      className="text-purple-600 hover:text-purple-800 text-sm font-semibold"
                    >
                      Products
                    </Link>
                    <button
                      onClick={() => deleteMerchant(merchant._id)}
                      className="text-red-600 hover:text-red-800 text-sm font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
