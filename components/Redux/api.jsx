// src/api/api.js
import axios from "axios";
import qs from "qs";
import Constants from "expo-constants";
const { apiUrl } = Constants.expoConfig.extra;

const api = axios.create({
    baseURL:apiUrl,
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;
export const api2 = axios.create({
    baseURL: apiUrl,
});
export const api3 = axios.create({
    baseURL: apiUrl,
    headers: {
        "Content-Type": "application/json",
    },
    paramsSerializer: (params) =>
        qs.stringify(params, { arrayFormat: "repeat" }),
});