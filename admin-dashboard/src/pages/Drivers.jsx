import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const res = await api.get("/admin/drivers");
      setDrivers(res.data || []);
    } catch (error) {
      console.error("Drivers fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const goToMap = (driver) => {
    if (!driver.currentLocation?.coordinates) {
      alert("Driver location not available");
      return;
    }
    const lat = driver.currentLocation.coordinates[1];
    const lng = driver.currentLocation.coordinates[0];
    navigate(`/drivers-map?lat=${lat}&lng=${lng}`);
  };

  const filtered = useMemo(() => {
    return drivers.filter((d) => {
      if (statusFilter === "online" && !d.isOnline) return false;
      if (statusFilter === "offline" && d.isOnline) return false;
      if (query) {
        const q = query.toLowerCase();
        const name = d.userId?.name?.toLowerCase() || "";
        const phone = d.userId?.phone || "";
        if (!name.includes(q) && !phone.includes(query)) return false;
      }
      return true;
    });
  }, [drivers, query, statusFilter]);

  const onlineCount = drivers.filter((d) => d.isOnline).length;

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Drivers</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filtered.length} of {drivers.length} drivers •{" "}
            <span className="text-green-600 font-semibold">
              {onlineCount} online
            </span>
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-5 flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="🔍 Search by name or phone..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 min-w-[200px] border border-gray-200 px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 px-4 py-2 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="all">All Status</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>
        {(query || statusFilter !== "all") && (
          <button
            onClick={() => {
              setQuery("");
              setStatusFilter("all");
            }}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Clear
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No drivers found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Driver
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Vehicle
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
              {filtered.map((driver) => {
                const name = driver.userId?.name || "Unknown";
                const initial = name.charAt(0).toUpperCase();
                const hasLocation = !!driver.currentLocation?.coordinates;
                return (
                  <tr key={driver._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                            {initial}
                          </div>
                          <span
                            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                              driver.isOnline ? "bg-green-500" : "bg-gray-300"
                            }`}
                          />
                        </div>
                        <div className="font-semibold text-gray-800">
                          {name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {driver.userId?.phone || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                      {driver.vehicleType || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                          driver.isOnline
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {driver.isOnline ? "● Online" : "○ Offline"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => goToMap(driver)}
                        disabled={!hasLocation}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold disabled:text-gray-300 disabled:cursor-not-allowed"
                      >
                        {hasLocation ? "View on Map →" : "No location"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
