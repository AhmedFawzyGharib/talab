import React, { useContext, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

import Login from "./pages/Login";
import DashboardLayout from "./pages/DashboardLayout";
import Overview from "./pages/Overview";
import Drivers from "./pages/Drivers";
import Merchants from "./pages/Merchants";
import Withdraws from "./pages/Withdraws";
import DriverApplications from "./pages/DriverApplications";
import MerchantApplications from "./pages/MerchantApplications";
import Products from "./pages/Products";
import CreateProduct from "./pages/CreateProduct";
import CreateMerchant from "./pages/CreateMerchant";
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

                <Route index element={<Overview />} />

                <Route
                  path="driver-applications"
                  element={<DriverApplications />}
                />

                <Route path="drivers" element={<Drivers />} />

                <Route
                  path="merchant-applications"
                  element={<MerchantApplications />}
                />

                <Route path="merchants" element={<Merchants />} />
                <Route path="merchants/create" element={<CreateMerchant />} />
                <Route path="products" element={<Products />} />

                <Route
                  path="products/create"
                  element={<CreateProduct />}
                />

                <Route path="withdraws" element={<Withdraws />} />

              </Route>

              <Route path="*" element={<Navigate to="/" />} />

            </>
          )}

        </Routes>

      </BrowserRouter>

    </div>
  );
}