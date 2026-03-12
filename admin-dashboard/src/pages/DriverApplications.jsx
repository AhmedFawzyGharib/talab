import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function DriverApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchApplications = async () => {
    try {
      const res = await api.get(
        "/admin/driver-applications"
      );
      setApplications(res.data);
    } catch (error) {
      console.error(error.response?.data || error);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      setLoading(true);

      await api.patch(
        `/admin/driver-applications/${id}`,
        { status }
      );

      // إعادة تحميل البيانات من السيرفر
      await fetchApplications();

    } catch (error) {
      console.error(
        error.response?.data || error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">
        Driver Applications
      </h1>

      <div className="bg-white shadow rounded">
        {applications.length === 0 && (
          <p className="p-4">
            No applications found
          </p>
        )}

        {applications.map((app) => (
          <div
            key={app._id}
            className="p-4 border-b flex justify-between"
          >
            <div>
              <p className="font-semibold">
                {app.fullName}
              </p>
              <p className="text-sm text-gray-500">
                {app.phone}
              </p>
              <p className="text-sm">
                Status: {app.status}
              </p>
            </div>

            {app.status === "pending" && (
              <div className="space-x-2">
                <button
                  disabled={loading}
                  onClick={() =>
                    updateStatus(app._id, "approved")
                  }
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Approve
                </button>

                <button
                  disabled={loading}
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
      </div>
    </>
  );
}