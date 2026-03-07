import React, { useEffect, useState } from "react";
import api from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Overview() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      }
    };

    fetchStats();
  }, []);

  if (!stats) {
    return <div className="text-xl">Loading Dashboard...</div>;
  }

  const chartData = [
    { name: "Drivers", value: stats.totalDrivers },
    { name: "Merchants", value: stats.totalMerchants },
    { name: "Orders", value: stats.totalOrders },
  ];

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">
        Dashboard Overview
      </h1>

      {/* Cards */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <h3 className="text-gray-500">Total Drivers</h3>
          <p className="text-3xl font-bold mt-2 text-blue-600">
            {stats.totalDrivers}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <h3 className="text-gray-500">Pending Drivers</h3>
          <p className="text-3xl font-bold mt-2 text-orange-500">
            {stats.pendingDrivers}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <h3 className="text-gray-500">Revenue</h3>
          <p className="text-3xl font-bold mt-2 text-green-600">
            ${stats.totalRevenue}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">
          System Growth
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}