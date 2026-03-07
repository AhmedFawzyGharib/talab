import React from "react";

export default function Dashboard({ onLogout }) {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-6">
        <h2 className="text-2xl font-bold text-blue-600 mb-6">
          🚀 Admin
        </h2>

        <ul className="space-y-4 text-gray-700">
          <li className="hover:text-blue-600 cursor-pointer">
            Dashboard
          </li>
          <li className="hover:text-blue-600 cursor-pointer">
            Drivers
          </li>
          <li className="hover:text-blue-600 cursor-pointer">
            Merchants
          </li>
        </ul>

        <button
          onClick={onLogout}
          className="mt-10 w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-6">
          Dashboard Overview
        </h1>

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500">Total Drivers</h3>
            <p className="text-2xl font-bold mt-2">25</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500">Pending Applications</h3>
            <p className="text-2xl font-bold mt-2">5</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500">Revenue</h3>
            <p className="text-2xl font-bold mt-2">$12,500</p>
          </div>
        </div>
      </div>
    </div>
  );
}