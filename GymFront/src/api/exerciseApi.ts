import type { Exercise } from "../types/exercise";

const API_BASE_URL = "http://localhost:8080/api";

export async function fetchAllExercises(): Promise<Exercise[]> {
  const response = await fetch(`${API_BASE_URL}/exercises`);

  if (!response.ok) {
    throw new Error("Failed to load exercises");
  }

  return response.json();
}