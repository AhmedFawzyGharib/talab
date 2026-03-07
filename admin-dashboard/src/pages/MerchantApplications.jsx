import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function MerchantApplications() {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get("/admin/merchant-applications");
        setApplications(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchApplications();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(
        `/admin/merchant-applications/${id}/status`,
        { status }
      );

      // نفس منطقك بدون تغيير
      setApplications((prev) =>
        prev.map((app) =>
          app._id === id ? { ...app, status } : app
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">
        Merchant Applications
      </h1>

      {applications.map((app) => (
        <div
          key={app._id}
          className="p-4 border-b bg-white"
        >
          <p className="font-semibold">
            {app.businessName}
          </p>
          <p>{app.phone}</p>
          <p>Status: {app.status}</p>

          {app.status === "pending" && (
            <div className="space-x-2 mt-2">
              <button
                onClick={() =>
                  updateStatus(app._id, "approved")
                }
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Approve
              </button>

              <button
                onClick={() =>
                  updateStatus(app._id, "rejected")
                }
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </>
  );
}