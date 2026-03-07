import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.1.5:5000/api" // ضع IP جهازك هنا
});

export default api;