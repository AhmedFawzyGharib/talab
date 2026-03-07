import React, { useContext } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function DashboardLayout({ darkMode, setDarkMode }) {

  const { logout } = useContext(AuthContext);

  const linkClass = ({ isActive }) =>
    `block px-4 py-2 rounded transition ${
      isActive
        ? "bg-blue-500 text-white"
        : darkMode
        ? "text-gray-300 hover:bg-gray-700"
        : "text-gray-700 hover:bg-gray-200"
    }`;

  return (
    <div
      className={`min-h-screen flex ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100"
      }`}
    >

      {/* Sidebar */}

      <div
        className={`w-64 shadow-lg p-6 ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >

        <h2 className="text-2xl font-bold text-blue-500 mb-8">
          🚀 Admin Panel
        </h2>

        <ul className="space-y-3">

          <li>
            <NavLink to="/" end className={linkClass}>
              Dashboard
            </NavLink>
          </li>

          <li>
            <NavLink to="/driver-applications" className={linkClass}>
              Driver Applications
            </NavLink>
          </li>

          <li>
            <NavLink to="/drivers" className={linkClass}>
              Drivers
            </NavLink>
          </li>

          <li>
            <NavLink to="/merchant-applications" className={linkClass}>
              Merchant Applications
            </NavLink>
          </li>

          <li>
            <NavLink to="/merchants" className={linkClass}>
              Merchants
            </NavLink>
          </li>

          <li>
            <NavLink to="/products" className={linkClass}>
              Products
            </NavLink>
          </li>

          <li>
            <NavLink to="/withdraws" className={linkClass}>
              Withdraw Requests
            </NavLink>
          </li>

        </ul>

        <div className="mt-10 space-y-3">

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full py-2 rounded ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-300 hover:bg-gray-400 text-black"
            }`}
          >
            Toggle Dark Mode
          </button>

          <button
            onClick={logout}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded"
          >
            Logout
          </button>

        </div>

      </div>

      <div className="flex-1 p-10">
        <Outlet />
      </div>

    </div>
  );
}