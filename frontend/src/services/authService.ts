import api from "./api";

export interface UserProfile {
  username: string;
  email: string;
}

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

export async function getProfile() {
  return api.get<UserProfile>("/api/auth/profile");
}

export async function updateProfile(profile: UserProfile) {
  return api.patch<UserProfile>("/api/auth/profile", profile);
}

export async function updateProfilePassword(input: {
  currentPassword: string;
  newPassword: string;
}) {
  return api.patch<{ message: string }>("/api/auth/profile/password", input);
}

export async function signOut() {
  return api.post("/api/auth/signOut");
}