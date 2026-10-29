import api from "./api";

export async function getToday(
  threshold: number = 5
) {
  return api.get("/api/get/getToday", {
    params: {
      threshold,
    },
  });
}