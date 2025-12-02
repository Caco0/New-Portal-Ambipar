import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL + "/api",
});

export const STRAPI_URL = "http://10.0.0.197:1337";
export default api;
