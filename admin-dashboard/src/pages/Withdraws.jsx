import React, { useEffect, useState, useMemo } from "react";
import api from "../services/api";

const STATUS_META = {
  pending: { color: "bg-amber-100 text-amber-700", label: "Pending" },
  approved: { color: "bg-green-100 text-green-700", label: "Approved" },
  rejected: { color: "bg-red-100 text-red-700", label: "Rejected" },
};

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Withdraws() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("pending");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/admin/withdraws");
      setRequests(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    const amount = requests.find((r) => r._id === id)?.amount;
    if (
      !window.confirm(
        `Are you sure you want to ${status === "approved" ? "APPROVE" : "REJECT"} the withdrawal of ${amount} SAR?`
      )
    ) {
      return;
    }
    try {
      setUpdatingId(id);
      const res = await api.patch(`/admin/withdraws/${id}`, { status });
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status } : r))
      );
      if (res.data?.message) {
        alert(res.data.message);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error updating request");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = useMemo(() => {
    if (statusFilter === "all") return requests;
    return requests.filter((r) => r.status === statusFilter);
  }, [requests, statusFilter]);

  const stats = useMemo(() => {
    return requests.reduce(
      (acc, r) => {
        acc.count[r.status] = (acc.count[r.status] || 0) + 1;
        if (r.status === "pending") acc.pendingAmount += r.amount || 0;
        if (r.status === "approved") acc.approvedAmount += r.amount || 0;
        return acc;
      },
      {
        count: { pending: 0, approved: 0, rejected: 0 },
        pendingAmount: 0,
        approvedAmount: 0,
      }
    );
  }, [requests]);

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
        <h1 className="text-3xl font-bold text-gray-800">Withdraw Requests</h1>
        <p className="text-sm text-gray-500 mt-1">
          Process driver withdrawal requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
          <div className="text-xs text-amber-700 font-semibold uppercase">
            Pending Amount
          </div>
          <div className="text-2xl font-bold text-amber-800 mt-1">
            {stats.pendingAmount.toLocaleString()} SAR
          </div>
          <div className="text-xs text-amber-600 mt-1">
            {stats.count.pending} requests
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
          <div className="text-xs text-green-700 font-semibold uppercase">
            Approved Amount
          </div>
          <div className="text-2xl font-bold text-green-800 mt-1">
            {stats.approvedAmount.toLocaleString()} SAR
          </div>
          <div className="text-xs text-green-600 mt-1">
            {stats.count.approved} requests
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
          <div className="text-xs text-red-700 font-semibold uppercase">
            Rejected
          </div>
          <div className="text-2xl font-bold text-red-800 mt-1">
            {stats.count.rejected}
          </div>
          <div className="text-xs text-red-600 mt-1">requests</div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-5 flex gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 px-4 py-2 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="all">All Requests</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button
          onClick={fetchRequests}
          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No withdraw requests</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Driver
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Requested
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((r) => {
                const meta = STATUS_META[r.status] || {
                  color: "bg-gray-100 text-gray-700",
                  label: r.status,
                };
                const driverName = r.driver?.userId?.name || "Unknown";
                const initial = driverName.charAt(0).toUpperCase();
                return (
                  <tr key={r._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                          {initial}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">
                            {driverName}
                          </div>
                          {r.driver?.userId?.phone && (
                            <div className="text-xs text-gray-500">
                              {r.driver.userId.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-800">
                      {r.amount?.toLocaleString()} SAR
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold ${meta.color}`}
                      >
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {timeAgo(r.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {r.status === "pending" ? (
                        <div className="flex gap-2 justify-end">
                          <button
                            disabled={updatingId === r._id}
                            onClick={() => updateStatus(r._id, "approved")}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-3 py-1.5 rounded-lg text-sm font-semibold"
                          >
                            Approve
                          </button>
                          <button
                            disabled={updatingId === r._id}
                            onClick={() => updateStatus(r._id, "rejected")}
                            className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-3 py-1.5 rounded-lg text-sm font-semibold"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Closed</span>
                      )}
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
