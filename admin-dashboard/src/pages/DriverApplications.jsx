import React, { useEffect, useState, useMemo } from "react";
import api from "../services/api";

const STATUS_META = {
  pending: { color: "bg-amber-100 text-amber-700", label: "Pending" },
  approved: { color: "bg-green-100 text-green-700", label: "Approved" },
  rejected: { color: "bg-red-100 text-red-700", label: "Rejected" },
};

export default function DriverApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [query, setQuery] = useState("");

  const fetchApplications = async () => {
    try {
      const res = await api.get("/admin/driver-applications");
      setApplications(res.data || []);
    } catch (error) {
      console.error(error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const updateStatus = async (id, status) => {
    if (
      !window.confirm(
        `Are you sure you want to ${status === "approved" ? "approve" : "reject"} this application?`
      )
    ) {
      return;
    }
    try {
      setUpdatingId(id);
      await api.patch(`/admin/driver-applications/${id}`, { status });
      await fetchApplications();
    } catch (error) {
      console.error(error.response?.data || error);
      alert(error.response?.data?.message || "Error updating status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = useMemo(() => {
    return applications.filter((app) => {
      if (statusFilter !== "all" && app.status !== statusFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        const name = app.fullName?.toLowerCase() || "";
        const phone = app.phone || "";
        if (!name.includes(q) && !phone.includes(query)) return false;
      }
      return true;
    });
  }, [applications, query, statusFilter]);

  const counts = useMemo(() => {
    return applications.reduce(
      (acc, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
      },
      { pending: 0, approved: 0, rejected: 0 }
    );
  }, [applications]);

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
        <h1 className="text-3xl font-bold text-gray-800">
          Driver Applications
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Review and process driver registration requests
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <button
          onClick={() => setStatusFilter("pending")}
          className={`p-4 rounded-xl border text-left transition ${
            statusFilter === "pending"
              ? "bg-amber-50 border-amber-300"
              : "bg-white border-gray-100 hover:border-amber-200"
          }`}
        >
          <div className="text-xs text-gray-500 font-semibold uppercase">
            Pending
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {counts.pending}
          </div>
        </button>
        <button
          onClick={() => setStatusFilter("approved")}
          className={`p-4 rounded-xl border text-left transition ${
            statusFilter === "approved"
              ? "bg-green-50 border-green-300"
              : "bg-white border-gray-100 hover:border-green-200"
          }`}
        >
          <div className="text-xs text-gray-500 font-semibold uppercase">
            Approved
          </div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {counts.approved}
          </div>
        </button>
        <button
          onClick={() => setStatusFilter("rejected")}
          className={`p-4 rounded-xl border text-left transition ${
            statusFilter === "rejected"
              ? "bg-red-50 border-red-300"
              : "bg-white border-gray-100 hover:border-red-200"
          }`}
        >
          <div className="text-xs text-gray-500 font-semibold uppercase">
            Rejected
          </div>
          <div className="text-2xl font-bold text-red-600 mt-1">
            {counts.rejected}
          </div>
        </button>
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
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 px-4 py-2 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-500">
            <p className="text-lg">No applications</p>
            <p className="text-sm mt-1">
              {statusFilter === "pending"
                ? "All caught up — no pending applications"
                : "Try a different filter"}
            </p>
          </div>
        ) : (
          filtered.map((app) => {
            const meta = STATUS_META[app.status] || {
              color: "bg-gray-100 text-gray-700",
              label: app.status,
            };
            const initial = (app.fullName || "?").charAt(0).toUpperCase();
            return (
              <div
                key={app._id}
                className="bg-white rounded-xl border border-gray-100 p-5 flex justify-between items-start flex-wrap gap-4"
              >
                <div className="flex gap-4 flex-1 min-w-[200px]">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {initial}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">
                      {app.fullName}
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      📞 {app.phone}
                    </div>
                    {app.vehicleType && (
                      <div className="text-sm text-gray-500 capitalize">
                        🚗 {app.vehicleType}
                      </div>
                    )}
                    {app.nationalId && (
                      <div className="text-xs text-gray-400 mt-0.5">
                        National ID: {app.nationalId}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-md text-xs font-semibold ${meta.color}`}
                  >
                    {meta.label}
                  </span>
                  {app.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        disabled={updatingId === app._id}
                        onClick={() => updateStatus(app._id, "approved")}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                      >
                        ✓ Approve
                      </button>
                      <button
                        disabled={updatingId === app._id}
                        onClick={() => updateStatus(app._id, "rejected")}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
