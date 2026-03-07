import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function BlockedEmails() {
  const [emails, setEmails] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const res = await api.get("/admin/blocked-emails");
        setEmails(res.data);
      } catch (err) {
        console.error("Failed to fetch blocked emails", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, []);

  const handleAdd = async () => {
    if (!newEmail) return alert("Email is required");

    try {
      setSubmitting(true);

      const res = await api.post("/admin/blocked-emails", {
        email: newEmail,
        reason,
      });

      setEmails((prev) => [res.data, ...prev]);
      setNewEmail("");
      setReason("");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await api.delete(`/admin/blocked-emails/${id}`);

      setEmails((prev) =>
        prev.filter((email) => email._id !== id)
      );
    } catch (err) {
      console.error("Failed to delete blocked email", err);
      alert("Delete failed");
    }
  };

  if (loading) {
    return <div className="text-xl">Loading...</div>;
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">
        Blocked Emails
      </h1>

      {/* Add Form */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Add Blocked Email
        </h2>

        <div className="grid grid-cols-3 gap-4">
          <input
            type="email"
            placeholder="Email address"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="border p-2 rounded"
          />

          <input
            type="text"
            placeholder="Reason (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="border p-2 rounded"
          />

          <button
            onClick={handleAdd}
            disabled={submitting}
            className="bg-red-500 hover:bg-red-600 text-white rounded px-4 py-2"
          >
            {submitting ? "Blocking..." : "Block Email"}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow">
        {emails.length === 0 ? (
          <div className="p-6 text-gray-500 text-center">
            No blocked emails
          </div>
        ) : (
          emails.map((item) => (
            <div
              key={item._id}
              className="flex justify-between items-center p-4 border-b"
            >
              <div>
                <p className="font-semibold">{item.email}</p>
                {item.reason && (
                  <p className="text-gray-500 text-sm">
                    Reason: {item.reason}
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  Blocked at:{" "}
                  {new Date(item.blockedAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => handleDelete(item._id)}
                className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}