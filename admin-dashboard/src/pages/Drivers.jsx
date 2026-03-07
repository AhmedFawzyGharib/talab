import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await api.get("/admin/drivers");
        setDrivers(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchDrivers();
  }, []);

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">
        Approved Drivers
      </h1>

      <div className="bg-white shadow rounded">
        {drivers.map((driver) => (
          <div
            key={driver._id}
            className="p-4 border-b"
          >
            <p className="font-semibold">
              {driver.user?.name}
            </p>
            <p className="text-sm text-gray-500">
              {driver.user?.phone}
            </p>
            <p className="text-sm">
              Wallet: ${driver.wallet}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}