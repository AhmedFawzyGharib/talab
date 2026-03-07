import React, { createContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();
export { AuthContext };

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(
    localStorage.getItem("adminToken")
  );

  const login = async (phone, password) => {
    try {
      const res = await api.post("/auth/login", {
        phone,
        password,
      });

      const jwt = res.data.token;

      localStorage.setItem("adminToken", jwt);
      setToken(jwt);
    } catch (err) {
      console.error("Login failed:", err);
      alert("Invalid credentials");
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}