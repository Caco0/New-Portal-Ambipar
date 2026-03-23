import axios from "axios";

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

export const STRAPI_URL = import.meta.env.VITE_STRAPI_URL;
export default api;
