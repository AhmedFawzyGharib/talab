import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function Withdraws() {

  const [requests, setRequests] = useState([]);

  useEffect(() => {

    const fetchRequests = async () => {

      try {

        const res = await api.get("/admin/withdraws");

        setRequests(res.data);

      } catch (error) {

        console.error(error);

      }

    };

    fetchRequests();

  }, []);

  const updateStatus = async (id, status) => {

    try {

      const res = await api.patch(`/admin/withdraws/${id}`, { status });

      alert(res.data.message);

      setRequests(prev =>
        prev.map(r =>
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

        {requests.length === 0 && (
          <p className="p-6 text-center text-gray-500">
            No withdraw requests
          </p>
        )}

        {requests.map(r => (

          <div
            key={r._id}
            className="p-4 border-b flex justify-between items-center"
          >

            <div>

              <p className="font-semibold">
                Driver: {r.driver?.userId?.name}
              </p>

              <p>
                Amount: ${r.amount}
              </p>

              <span
                className={`px-2 py-1 rounded text-sm ${
                  r.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : r.status === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {r.status}
              </span>

            </div>

            {r.status === "pending" && (

              <div className="space-x-2">

                <button
                  onClick={() => updateStatus(r._id, "approved")}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                >
                  Approve
                </button>

                <button
                  onClick={() => updateStatus(r._id, "rejected")}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
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