import api from "./api";

export async function login(
  username: string,
  password: string
) {
  return api.post("/api/login", {
    username,
    password,
  });
}

export async function getCurrentUser() {
  return api.get("/api/me");
}

export async function logout() {
  return api.post("/api/logout");
}