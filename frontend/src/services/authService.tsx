import axios from "axios";
import { getToken } from "../utilites/auth";

const API_URL = "http://localhost:8080/api/auth";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    console.log("Adding token to request:", token);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (email: string, password: string) => {
  return api.post("/login", { email, password });
};

export const register = (username: string, email: string, password: string) => {
  return api.post("/register", { username, email, password });
};

export const getProfile = () => {
  console.log("Fetching profile with token:", getToken());
  return api.get("/me");
};
