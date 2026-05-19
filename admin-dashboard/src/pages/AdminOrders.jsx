import React, { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import OrderModal from "../components/OrderModal";
import AssignDriverModal from "../components/AssignDriverModal";

const STATUS_META = {
  pending: { color: "bg-amber-100 text-amber-700", label: "Pending" },
  accepted: { color: "bg-blue-100 text-blue-700", label: "Accepted" },
  on_the_way: { color: "bg-purple-100 text-purple-700", label: "On the way" },
  delivered: { color: "bg-green-100 text-green-700", label: "Delivered" },
  cancelled: { color: "bg-red-100 text-red-700", label: "Cancelled" },
};

const TYPE_META = {
  merchant: { color: "bg-indigo-100 text-indigo-700", label: "🏬 Merchant" },
  custom: { color: "bg-purple-100 text-purple-700", label: "📦 Custom" },
};

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [assignOrder, setAssignOrder] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = async () => {
    try {
      const res = await api.get("/admin/orders");
      setOrders(res.data || []);
    } catch (error) {
      console.error("Orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const cancelOrder = async (id) => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      await api.patch(`/admin/orders/${id}/cancel`);
      fetchOrders();
    } catch (error) {
      console.error(error);
    }
  };

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        const id = o._id.toLowerCase();
        const customer = o.customer?.name?.toLowerCase() || "";
        const phone = o.customer?.phone || "";
        if (
          !id.includes(q) &&
          !customer.includes(q) &&
          !phone.includes(query)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [orders, query, statusFilter]);

  const stats = useMemo(() => {
    const counts = { pending: 0, accepted: 0, delivered: 0, cancelled: 0 };
    orders.forEach((o) => {
      if (counts[o.status] !== undefined) counts[o.status]++;
    });
    return counts;
  }, [orders]);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Orders</h1>
        <p className="text-sm text-gray-500 mt-1">
          {filtered.length} of {orders.length} orders
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <div className="text-xs text-gray-500 font-semibold uppercase">
            Pending
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {stats.pending}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <div className="text-xs text-gray-500 font-semibold uppercase">
            Accepted
          </div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {stats.accepted}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <div className="text-xs text-gray-500 font-semibold uppercase">
            Delivered
          </div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {stats.delivered}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <div className="text-xs text-gray-500 font-semibold uppercase">
            Cancelled
          </div>
          <div className="text-2xl font-bold text-red-600 mt-1">
            {stats.cancelled}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-5 flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="🔍 Search by order ID, customer name or phone..."
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
          {Object.entries(STATUS_META).map(([key, meta]) => (
            <option key={key} value={key}>
              {meta.label}
            </option>
          ))}
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
        <button
          onClick={fetchOrders}
          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((order) => {
                  const status = STATUS_META[order.status] || {
                    color: "bg-gray-100 text-gray-700",
                    label: order.status,
                  };
                  const type = TYPE_META[order.type] || {
                    color: "bg-gray-100 text-gray-700",
                    label: order.type || "—",
                  };
                  return (
                    <tr key={order._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-3 font-mono text-sm text-gray-700">
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-6 py-3">
                        <div className="text-sm font-semibold text-gray-800">
                          {order.customer?.name || "—"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.customer?.phone || ""}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${type.color}`}
                        >
                          {type.label}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right font-semibold text-gray-800">
                        {order.totalPrice} SAR
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-xs text-gray-500">
                        {timeAgo(order.createdAt)}
                      </td>
                      <td className="px-6 py-3 text-right space-x-3 whitespace-nowrap">
                        <button
                          onClick={() => setSelected(order)}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold"
                        >
                          Details
                        </button>
                        {order.status === "pending" && (
                          <button
                            onClick={() => setAssignOrder(order)}
                            className="text-green-600 hover:text-green-800 text-sm font-semibold"
                          >
                            Assign
                          </button>
                        )}
                        {order.status !== "cancelled" &&
                          order.status !== "delivered" && (
                            <button
                              onClick={() => cancelOrder(order._id)}
                              className="text-red-600 hover:text-red-800 text-sm font-semibold"
                            >
                              Cancel
                            </button>
                          )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <OrderModal order={selected} onClose={() => setSelected(null)} />
      <AssignDriverModal
        order={assignOrder}
        onClose={() => setAssignOrder(null)}
        onAssigned={fetchOrders}
      />
    </div>
  );
}
