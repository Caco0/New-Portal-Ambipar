import axios from "axios";

export const strapi = axios.create({
    baseURL: `${import.meta.env.VITE_STRAPI_URL}/api`,
});

export function setStrapiToken(jwt?: string) {
    if (jwt) api.defaults.headers.common.Authorization = `Bearer ${jwt}`;
    else delete api.defaults.headers.common.Authorization;
}
