import React, { useContext, useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { NAV_SECTIONS } from "../constants/navigation";

export default function DashboardLayout({ darkMode, setDarkMode }) {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    setProfileOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currentPageTitle = (() => {
    for (const section of NAV_SECTIONS) {
      const found = section.items.find((it) =>
        it.end
          ? location.pathname === it.to
          : location.pathname.startsWith(it.to)
      );
      if (found) return found.label;
    }
    return "Dashboard";
  })();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
      isActive
        ? darkMode
          ? "bg-indigo-600 text-white shadow"
          : "bg-indigo-600 text-white shadow"
        : darkMode
        ? "text-gray-300 hover:bg-gray-700"
        : "text-gray-600 hover:bg-gray-100"
    }`;

  const initial = (user?.name || "?").charAt(0).toUpperCase();

  return (
    <div
      className={`min-h-screen flex ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50"
      }`}
    >
      {/* SIDEBAR */}
      <aside
        className={`${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static z-40 w-64 h-screen md:h-auto md:sticky md:top-0 flex flex-col transition-transform shadow-xl md:shadow-none ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        {/* LOGO */}
        <div
          className={`p-6 border-b ${
            darkMode ? "border-gray-700" : "border-gray-100"
          }`}
        >
          <h2 className="text-2xl font-bold text-indigo-600">
            🚀 Talab Admin
          </h2>
          <p
            className={`text-xs mt-1 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Delivery Platform
          </p>
        </div>

        {/* MENU */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3
                className={`px-3 mb-2 text-xs font-bold uppercase tracking-wider ${
                  darkMode ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.to}>
                    <NavLink to={item.to} end={item.end} className={linkClass}>
                      <span className="text-base">{item.icon}</span>
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* FOOTER */}
        <div
          className={`p-4 border-t ${
            darkMode ? "border-gray-700" : "border-gray-100"
          }`}
        >
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER */}
        <header
          className={`sticky top-0 z-20 px-6 py-3 flex justify-between items-center border-b ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-100"
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className={`md:hidden p-2 rounded-lg ${
                darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
              }`}
            >
              ☰
            </button>
            <div>
              <h1 className="text-lg font-bold">{currentPageTitle}</h1>
              <p
                className={`text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* PROFILE DROPDOWN */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((s) => !s)}
              className={`flex items-center gap-3 px-3 py-1.5 rounded-lg transition ${
                darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                {initial}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-sm font-semibold leading-tight">
                  {user?.name || "Admin"}
                </div>
                <div
                  className={`text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {user?.role || "—"}
                </div>
              </div>
              <span className="text-xs text-gray-400">▾</span>
            </button>

            {profileOpen && (
              <div
                className={`absolute right-0 mt-2 w-64 rounded-xl shadow-lg border overflow-hidden z-30 ${
                  darkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-100"
                }`}
              >
                <div
                  className={`px-4 py-3 border-b ${
                    darkMode ? "border-gray-700" : "border-gray-100"
                  }`}
                >
                  <div className="font-semibold">{user?.name || "Admin"}</div>
                  <div
                    className={`text-xs mt-0.5 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {user?.phone}
                  </div>
                  {user?.email && (
                    <div
                      className={`text-xs ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {user.email}
                    </div>
                  )}
                  <span
                    className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-semibold ${
                      user?.role === "super_admin"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-indigo-100 text-indigo-700"
                    }`}
                  >
                    {user?.role || "—"}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className={`w-full text-left px-4 py-3 text-sm font-semibold text-red-600 transition ${
                    darkMode ? "hover:bg-gray-700" : "hover:bg-red-50"
                  }`}
                >
                  ⎋ Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
