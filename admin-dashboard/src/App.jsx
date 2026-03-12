import React, { useContext, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

/* AUTH */

import Login from "./pages/Login";

/* LAYOUT */

import DashboardLayout from "./pages/DashboardLayout";

/* DASHBOARD */

import Overview from "./pages/Overview";

/* DRIVERS */

import Drivers from "./pages/Drivers";
import DriverApplications from "./pages/DriverApplications";
import DriversMap from "./pages/DriversMap";

/* MERCHANTS */

import Merchants from "./pages/Merchants";
import MerchantApplications from "./pages/MerchantApplications";
import CreateMerchant from "./pages/CreateMerchant";

/* PRODUCTS */

import Products from "./pages/Products";
import CreateProduct from "./pages/CreateProduct";

/* ORDERS */

import AdminOrders from "./pages/AdminOrders";
import LiveOrders from "./pages/LiveOrders";

/* ANALYTICS */

import Analytics from "./pages/Analytics";

/* FINANCE */

import Withdraws from "./pages/Withdraws";

/* EXTRA */

import BlockedEmails from "./pages/BlockedEmails";
import CreateUser from "./pages/CreateUser";

/* MAPS */

import DispatchMap from "./pages/DispatchMap";

export default function App() {

  const { token } = useContext(AuthContext);

  const [darkMode, setDarkMode] = useState(false);

  return (

    <div className={darkMode ? "dark bg-gray-900 text-white" : ""}>

      <BrowserRouter>

        <Routes>

          {!token ? (

            <>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </>

          ) : (

            <>
              <Route
                path="/"
                element={
                  <DashboardLayout
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                  />
                }
              >

                {/* Dashboard */}

                <Route index element={<Overview />} />

                {/* Drivers */}

                <Route
                  path="driver-applications"
                  element={<DriverApplications />}
                />

                <Route
                  path="drivers"
                  element={<Drivers />}
                />

                <Route
                  path="drivers-map"
                  element={<DriversMap />}
                />

                {/* Merchants */}

                <Route
                  path="merchant-applications"
                  element={<MerchantApplications />}
                />

                <Route
                  path="merchants"
                  element={<Merchants />}
                />

                <Route
                  path="merchants/create"
                  element={<CreateMerchant />}
                />

                {/* Products */}

                <Route
                  path="products"
                  element={<Products />}
                />

                <Route
                  path="products/create"
                  element={<CreateProduct />}
                />

                {/* Orders */}

                <Route
                  path="orders"
                  element={<AdminOrders />}
                />

                <Route
                  path="live-orders"
                  element={<LiveOrders />}
                />

                {/* Analytics */}

                <Route
                  path="analytics"
                  element={<Analytics />}
                />

                {/* Finance */}

                <Route
                  path="withdraws"
                  element={<Withdraws />}
                />

                {/* Maps */}

                <Route
                  path="dispatch-map"
                  element={<DispatchMap />}
                />

                {/* Extra */}

                <Route
                  path="blocked-emails"
                  element={<BlockedEmails />}
                />

                <Route
                  path="create-user"
                  element={<CreateUser />}
                />

              </Route>

              <Route path="*" element={<Navigate to="/" />} />

            </>

          )}

        </Routes>

      </BrowserRouter>

    </div>

  );

}