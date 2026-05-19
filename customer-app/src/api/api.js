import axios from "axios";

const api = axios.create({
  baseURL: "http://10.0.0.99:5000/api" // ضع IP جهازك هنا
});

export default api;