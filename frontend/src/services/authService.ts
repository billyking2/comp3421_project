import api from "./api";

export async function signIn(
  username: string,
  password: string
) {
  return api.post("/api/auth/signIn", {
    username,
    password,
  });
}

export async function signUp(
    username: string,
    email: string,
    password: string
) {
  return api.post ("/api/auth/signUp", {
    username,
    email,
    password
  })
}

export async function getCurrentUser() {
  return api.get("/api/auth/me");
}

export async function signOut() {
  return api.post("/api/auth/signOut");
}