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

export const register = (
  params:
    | { role: "CUSTOMER" | "SELLER"; username: string; name: string; email: string; password: string; phone?: string }
    | { username: string; name: string; email: string; password: string; phone?: string; role?: "CUSTOMER" | "SELLER" }
) => {
  const { role = "CUSTOMER", ...payload } = params as any;
  const path = role === "SELLER" ? "/register/seller" : "/register/user";
  return api.post(path, payload);
};

export const sendVerificationEmail = (email: string) => {
  // Backend expects UserLoginRequestDto, but only email is used
  return api.post("/send-verification-email", { email });
};

export const getVerificationStatus = (email: string) => {
  return api.get("/verification-status", { params: { email } });
};

export const getProfile = () => {
  console.log("Fetching profile with token:", getToken());
  return api.get("/me");
};
