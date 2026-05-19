import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";

const STATUS_COLOR = {
  pending: "#f59e0b",
  accepted: "#3b82f6",
  on_the_way: "#8b5cf6",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

const TYPE_COLOR = {
  restaurant: "#f59e0b",
  market: "#6366f1",
  pharmacy: "#10b981",
  clothing: "#ec4899",
  store: "#6b7280",
};

const STAT_CARDS = [
  {
    key: "totalDrivers",
    label: "Drivers",
    icon: "🚚",
    color: "from-blue-500 to-blue-600",
  },
  {
    key: "totalMerchants",
    label: "Merchants",
    icon: "🏬",
    color: "from-purple-500 to-purple-600",
  },
  {
    key: "totalOrders",
    label: "Total Orders",
    icon: "📋",
    color: "from-indigo-500 to-indigo-600",
  },
  {
    key: "ordersToday",
    label: "Orders Today",
    icon: "⚡",
    color: "from-amber-500 to-amber-600",
  },
  {
    key: "totalRevenue",
    label: "Total Revenue",
    icon: "💰",
    color: "from-green-500 to-green-600",
    isMoney: true,
  },
];

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/stats");
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const statusData = Object.entries(stats.ordersByStatus || {}).map(
    ([key, value]) => ({
      name: key.replace("_", " "),
      value,
      color: STATUS_COLOR[key] || "#6b7280",
    })
  );

  const typeData = (stats.merchantsByType || []).map((t) => ({
    name: t.type,
    value: t.count,
    color: TYPE_COLOR[t.type] || "#6b7280",
  }));

  const revenueChartData = (stats.revenueByDay || []).map((d) => ({
    date: formatDate(d.date),
    revenue: d.revenue,
    orders: d.orders,
  }));

  return (
    <div className="space-y-6">
      {/* Greeting + revenue summary */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold">Today's Performance</h2>
            <p className="text-indigo-100 mt-1 text-sm">
              Live overview of your delivery platform
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider text-indigo-200">
              Revenue Today
            </div>
            <div className="text-3xl font-bold mt-1">
              {stats.revenueToday.toLocaleString()} SAR
            </div>
            <div className="text-xs text-indigo-200 mt-1">
              {stats.ordersToday} orders today
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {STAT_CARDS.map((card) => (
          <div
            key={card.key}
            className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center text-xl shadow-md`}
              >
                {card.icon}
              </div>
            </div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {card.label}
            </div>
            <div className="text-2xl font-bold text-gray-800 mt-1">
              {card.isMoney
                ? `${(stats[card.key] || 0).toLocaleString()} SAR`
                : (stats[card.key] || 0).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Alerts row */}
      {(stats.pendingDrivers > 0 || stats.pendingMerchants > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.pendingDrivers > 0 && (
            <Link
              to="/driver-applications"
              className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between hover:bg-amber-100 transition"
            >
              <div>
                <div className="text-amber-800 font-semibold">
                  🚚 {stats.pendingDrivers} Driver application
                  {stats.pendingDrivers !== 1 ? "s" : ""} pending
                </div>
                <div className="text-xs text-amber-700 mt-0.5">
                  Click to review applications
                </div>
              </div>
              <span className="text-amber-600">→</span>
            </Link>
          )}
          {stats.pendingMerchants > 0 && (
            <Link
              to="/merchant-applications"
              className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center justify-between hover:bg-purple-100 transition"
            >
              <div>
                <div className="text-purple-800 font-semibold">
                  🏪 {stats.pendingMerchants} Merchant application
                  {stats.pendingMerchants !== 1 ? "s" : ""} pending
                </div>
                <div className="text-xs text-purple-700 mt-0.5">
                  Click to review applications
                </div>
              </div>
              <span className="text-purple-600">→</span>
            </Link>
          )}
        </div>
      )}

      {/* Revenue chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Revenue Trend</h3>
            <p className="text-xs text-gray-500">Last 7 days</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={revenueChartData}>
            <defs>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#6366f1"
              strokeWidth={2.5}
              fill="url(#colorRev)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Two pie charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Orders by Status
          </h3>
          {statusData.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(d) => `${d.value}`}
                >
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, textTransform: "capitalize" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Merchants by Type
          </h3>
          {typeData.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie
                  data={typeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(d) => `${d.value}`}
                >
                  {typeData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, textTransform: "capitalize" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Recent Orders</h3>
          <Link
            to="/orders"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            View all →
          </Link>
        </div>
        {(stats.recentOrders || []).length === 0 ? (
          <p className="text-center text-gray-400 py-10">No orders yet</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Order
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Customer
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Amount
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-mono text-sm text-gray-700">
                    #{order._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-700">
                    {order.customerName || "—"}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-semibold capitalize"
                      style={{
                        backgroundColor:
                          (STATUS_COLOR[order.status] || "#9ca3af") + "22",
                        color: STATUS_COLOR[order.status] || "#6b7280",
                      }}
                    >
                      {order.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-right font-semibold text-gray-800">
                    {order.totalPrice} SAR
                  </td>
                  <td className="px-6 py-3 text-right text-xs text-gray-500">
                    {timeAgo(order.createdAt)}
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
