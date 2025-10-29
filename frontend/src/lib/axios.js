import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.mode === "development" ? "http://localhost:5000/api" : "https://dreamshops.onrender.com/api",
    withCredentials: true,  // with every request by default the cookies will be sent to the server
});

export default axiosInstance;