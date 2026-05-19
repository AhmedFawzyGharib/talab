import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();
export { AuthContext };

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("adminToken"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    api
      .get("/users/me")
      .then((res) => {
        if (!cancelled) setUser(res.data);
      })
      .catch(() => {
        if (!cancelled) {
          localStorage.removeItem("adminToken");
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = async (phone, password) => {
    const res = await api.post("/auth/login", { phone, password });
    const jwt = res.data.token;
    localStorage.setItem("adminToken", jwt);
    setToken(jwt);
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
