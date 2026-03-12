import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Drivers() {

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {

    const fetchDrivers = async () => {

      try {

        const res = await api.get("/admin/drivers");

        setDrivers(res.data);

      } catch (error) {

        console.error("Drivers fetch error:", error);

      } finally {

        setLoading(false);

      }

    };

    fetchDrivers();

  }, []);

  const goToMap = (driver) => {

    if (!driver.currentLocation?.coordinates) {

      alert("Driver location not available");

      return;

    }

    const lat = driver.currentLocation.coordinates[1];
    const lng = driver.currentLocation.coordinates[0];

    navigate(`/drivers-map?lat=${lat}&lng=${lng}`);

  };

  if (loading) {

    return <p className="text-xl">Loading drivers...</p>;

  }

  return (

    <div>

      <h1 className="text-3xl font-bold mb-6">
        Drivers
      </h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-4 text-left">Name</th>

              <th className="p-4 text-left">Phone</th>

              <th className="p-4 text-left">Vehicle</th>

              <th className="p-4 text-left">Status</th>

              <th className="p-4 text-left">Map</th>

            </tr>

          </thead>

          <tbody>

            {drivers.length === 0 && (

              <tr>

                <td colSpan="5" className="p-6 text-center text-gray-500">

                  No drivers found

                </td>

              </tr>

            )}

            {drivers.map(driver => (

              <tr
                key={driver._id}
                className="border-t hover:bg-gray-50"
              >

                <td className="p-4 font-semibold">

                  {driver.userId?.name}

                </td>

                <td className="p-4">

                  {driver.userId?.phone}

                </td>

                <td className="p-4">

                  {driver.vehicleType}

                </td>

                <td className="p-4">

                  {driver.isOnline ? (

                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">

                      Online

                    </span>

                  ) : (

                    <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">

                      Offline

                    </span>

                  )}

                </td>

                <td className="p-4">

                  <button
                    onClick={() => goToMap(driver)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  >

                    View Map

                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}