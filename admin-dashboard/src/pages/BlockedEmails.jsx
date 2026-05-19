import React, { useEffect, useState, useMemo } from "react";
import api from "../services/api";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function BlockedEmails() {
  const [emails, setEmails] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      const res = await api.get("/admin/blocked-emails");
      setEmails(res.data || []);
    } catch (err) {
      console.error("Failed to fetch blocked emails", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e?.preventDefault?.();
    setError("");

    const trimmed = newEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return setError("Please enter a valid email address");
    }

    try {
      setSubmitting(true);
      const res = await api.post("/admin/blocked-emails", {
        email: trimmed,
        reason: reason.trim() || undefined,
      });
      setEmails((prev) => [res.data, ...prev]);
      setNewEmail("");
      setReason("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not block email");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, email) => {
    if (!window.confirm(`Unblock ${email}?`)) return;
    try {
      await api.delete(`/admin/blocked-emails/${id}`);
      setEmails((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  const filtered = useMemo(() => {
    if (!query) return emails;
    const q = query.toLowerCase();
    return emails.filter(
      (e) =>
        e.email.toLowerCase().includes(q) ||
        (e.reason || "").toLowerCase().includes(q)
    );
  }, [emails, query]);

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
        <h1 className="text-3xl font-bold text-gray-800">Blocked Emails</h1>
        <p className="text-sm text-gray-500 mt-1">
          Block emails from registering on the platform
        </p>
      </div>

      {/* Add form */}
      <form
        onSubmit={handleAdd}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-5"
      >
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Block New Email
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm mb-3">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="email"
            placeholder="Email address"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="border border-gray-200 px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <input
            type="text"
            placeholder="Reason (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="border border-gray-200 px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-4 py-2 rounded-lg font-semibold"
          >
            {submitting ? "Blocking..." : "🚫 Block Email"}
          </button>
        </div>
      </form>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-5 flex gap-3">
        <input
          type="text"
          placeholder="🔍 Search blocked emails..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border border-gray-200 px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <div className="text-sm text-gray-500 self-center whitespace-nowrap">
          {filtered.length} of {emails.length}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No blocked emails</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Blocked
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-3 font-semibold text-gray-800">
                    {item.email}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {item.reason || (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-xs text-gray-500">
                    {timeAgo(item.blockedAt)}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => handleDelete(item._id, item.email)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold"
                    >
                      Unblock
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
