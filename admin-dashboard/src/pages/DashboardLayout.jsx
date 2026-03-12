import React, { useContext } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function DashboardLayout({ darkMode, setDarkMode }) {

  const { logout } = useContext(AuthContext);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg transition ${
      isActive
        ? "bg-blue-500 text-white"
        : darkMode
        ? "text-gray-300 hover:bg-gray-700"
        : "text-gray-700 hover:bg-gray-200"
    }`;

  return (

    <div className={`min-h-screen flex ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100"}`}>

      {/* SIDEBAR */}

      <div className={`w-64 shadow-xl flex flex-col ${darkMode ? "bg-gray-800" : "bg-white"}`}>

        {/* LOGO */}

        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-blue-500">
            🚀 Admin Panel
          </h2>
        </div>

        {/* MENU */}

        <div className="flex-1 overflow-y-auto p-4">

          <ul className="space-y-2">

            <li>
              <NavLink to="/" end className={linkClass}>
                📊 Dashboard
              </NavLink>
            </li>

            <li>
              <NavLink to="/driver-applications" className={linkClass}>
                🧾 Driver Applications
              </NavLink>
            </li>

            <li>
              <NavLink to="/drivers" className={linkClass}>
                🚚 Drivers
              </NavLink>
            </li>

            <li>
              <NavLink to="/drivers-map" className={linkClass}>
                🗺 Drivers Map
              </NavLink>
            </li>

            <li>
              <NavLink to="/merchant-applications" className={linkClass}>
                🏪 Merchant Applications
              </NavLink>
            </li>

            <li>
              <NavLink to="/merchants" className={linkClass}>
                🏬 Merchants
              </NavLink>
            </li>

            <li>
              <NavLink to="/products" className={linkClass}>
                📦 Products
              </NavLink>
            </li>

            <li>
              <NavLink to="/orders" className={linkClass}>
                📋 Orders
              </NavLink>
            </li>

            <li>
              <NavLink to="/live-orders" className={linkClass}>
                ⚡ Live Orders
              </NavLink>
            </li>

            <li>
              <NavLink to="/analytics" className={linkClass}>
                📈 Analytics
              </NavLink>
            </li>

            <li>
              <NavLink to="/withdraws" className={linkClass}>
                💰 Withdraw Requests
              </NavLink>
            </li>

            <li>
              <NavLink to="/dispatch-map" className={linkClass}>
                🗺 Dispatch Map
              </NavLink>
            </li>

            <li>
              <NavLink to="/blocked-emails" className={linkClass}>
                🚫 Blocked Emails
              </NavLink>
            </li>

            <li>
              <NavLink to="/create-user" className={linkClass}>
                👤 Create User
              </NavLink>
            </li>

          </ul>

        </div>

        {/* FOOTER BUTTONS */}

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full py-2 rounded-lg font-semibold transition ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-300 hover:bg-gray-400 text-black"
            }`}
          >
            🌙 Toggle Dark Mode
          </button>

          <button
            onClick={logout}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold"
          >
            Logout
          </button>

        </div>

      </div>

      {/* MAIN AREA */}

      <div className="flex-1 flex flex-col">

        {/* HEADER */}

        <div className={`px-8 py-4 shadow-sm flex justify-between items-center ${darkMode ? "bg-gray-800" : "bg-white"}`}>

          <h1 className="text-xl font-semibold">
            Admin Dashboard
          </h1>

          <div className="text-sm text-gray-400">
            Delivery System
          </div>

        </div>

        {/* PAGE CONTENT */}

        <div className="flex-1 p-8 overflow-y-auto">

          <Outlet />

        </div>

      </div>

    </div>

  );

}