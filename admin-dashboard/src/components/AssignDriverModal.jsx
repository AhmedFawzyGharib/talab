import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function AssignDriverModal({
  order,
  onClose,
  onAssigned
}) {

  const [drivers, setDrivers] = useState([]);
  const [selected, setSelected] = useState("");

  useEffect(() => {

    const fetchDrivers = async () => {

      const res = await api.get("/admin/drivers-list");

      setDrivers(res.data);

    };

    fetchDrivers();

  }, []);

  const assign = async () => {

    await api.patch(
      `/admin/orders/${order._id}/assign-driver`,
      { driverId: selected }
    );

    onAssigned();

    onClose();

  };

  if (!order) return null;

  return (

    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">

      <div className="bg-white p-6 rounded shadow w-96">

        <h2 className="text-xl font-bold mb-4">
          Assign Driver
        </h2>

        <select
          className="border w-full p-2"
          onChange={(e) => setSelected(e.target.value)}
        >

          <option value="">
            Select driver
          </option>

          {drivers.map(d => (

            <option
              key={d._id}
              value={d._id}
            >

              {d.userId?.name}

            </option>

          ))}

        </select>

        <div className="flex justify-end mt-4 space-x-2">

          <button
            onClick={onClose}
            className="bg-gray-300 px-3 py-1 rounded"
          >
            Cancel
          </button>

          <button
            onClick={assign}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            Assign
          </button>

        </div>

      </div>

    </div>

  );

}