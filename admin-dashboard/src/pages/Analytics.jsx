import React, { useEffect, useState } from "react";
import api from "../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function Analytics() {

  const [data, setData] = useState([]);

  useEffect(() => {

    const fetchData = async () => {

      try {

        const res = await api.get("/admin/stats");

        const chartData = [

          {
            name: "Drivers",
            value: res.data.totalDrivers
          },

          {
            name: "Merchants",
            value: res.data.totalMerchants
          },

          {
            name: "Orders",
            value: res.data.totalOrders
          }

        ];

        setData(chartData);

      } catch (error) {

        console.error(error);

      }

    };

    fetchData();

  }, []);

  return (

    <div>

      <h1 className="text-2xl font-bold mb-6">
        Analytics
      </h1>

      <div className="bg-white p-6 rounded shadow">

        <ResponsiveContainer width="100%" height={400}>

          <LineChart data={data}>

            <XAxis dataKey="name" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#2563eb"
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>

  );

}