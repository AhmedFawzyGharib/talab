import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);
  const [applicationPending, setApplicationPending] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/users/me");
      setUser(res.data);
    } catch (err) {
      console.log("PROFILE FETCH ERROR:", err.response?.status);
      if (err.response?.status === 401) {
        await AsyncStorage.removeItem("driverToken");
        delete api.defaults.headers.common["Authorization"];
        setUserToken(null);
        setUser(null);
      }
    }
  };

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const token = await AsyncStorage.getItem("driverToken");
        const pending = await AsyncStorage.getItem("applicationPending");

        if (token) {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          setUserToken(token);
          await fetchProfile();
        }

        if (pending === "true") {
          setApplicationPending(true);
        }
      } catch (err) {
        console.log("INIT ERROR:", err);
      }
      setLoading(false);
    };

    loadStoredData();
  }, []);

  const login = async (phone, password) => {
    try {
      const res = await api.post("/auth/login", { phone, password });
      const token = res.data.token;

      await AsyncStorage.setItem("driverToken", token);
      await AsyncStorage.removeItem("applicationPending");

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUserToken(token);
      setApplicationPending(false);

      await fetchProfile();

      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
      };
    }
  };

  const markApplicationPending = async () => {
    await AsyncStorage.setItem("applicationPending", "true");
    setApplicationPending(true);
  };

  const clearApplicationPending = async () => {
    await AsyncStorage.removeItem("applicationPending");
    setApplicationPending(false);
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("driverToken");
      await AsyncStorage.removeItem("applicationPending");
      delete api.defaults.headers.common["Authorization"];
      setUserToken(null);
      setUser(null);
      setApplicationPending(false);
    } catch (err) {
      console.log("LOGOUT ERROR:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userToken,
        user,
        applicationPending,
        loading,
        login,
        logout,
        markApplicationPending,
        clearApplicationPending,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
