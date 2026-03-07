import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function Withdraws() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      const res = await api.get("/admin/withdraw-requests");
      setRequests(res.data);
    };

    fetchRequests();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const res = await api.patch(
        `/admin/withdraw-requests/${id}/status`,
        { status }
      );

      alert(res.data.message);

      setRequests((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, status } : r
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">
        Withdraw Requests
      </h1>

      <div className="bg-white rounded-xl shadow">
        {requests.map((r) => (
          <div
            key={r._id}
            className="p-4 border-b flex justify-between"
          >
            <div>
              Driver: {r.driver?.user} | ${r.amount}
            </div>

            {r.status === "pending" && (
              <div className="space-x-2">
                <button
                  onClick={() =>
                    updateStatus(r._id, "approved")
                  }
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Approve
                </button>

                <button
                  onClick={() =>
                    updateStatus(r._id, "rejected")
                  }
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}