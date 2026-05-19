import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://10.0.0.99:5000/api"; // IP السيرفر

/* ===============================
   Public API (بدون توكن)
================================= */
export const publicApi = axios.create({
  baseURL: BASE_URL,
});

/* ===============================
   Protected API (مع توكن السائق)
================================= */
const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(
  async (config) => {
    // 🔥 نقرأ driverToken وليس token
    const token = await AsyncStorage.getItem("driverToken");

    console.log("DRIVER TOKEN FROM STORAGE:", token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;