import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        if (token) {
          setUserToken(token);
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
      } catch (error) {
        console.log("Token load error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadToken();
  }, []);

  const login = async (phone, password) => {
    try {
      const res = await api.post("/auth/login", { phone, password });

      const token = res.data.token;

      await AsyncStorage.setItem("token", token);

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUserToken(token);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const setTokenDirectly = async (token) => {
    await AsyncStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUserToken(token);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setUserToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        userToken,
        loading,
        login,
        logout,
        setTokenDirectly,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};