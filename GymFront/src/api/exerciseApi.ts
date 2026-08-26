import type { Exercise } from "../types/exercise";

const API_BASE_URL = "http://localhost:8080/api";

export async function fetchAllExercises(): Promise<Exercise[]> {
  const response = await fetch(`${API_BASE_URL}/exercises`);

  if (!response.ok) {
    throw new Error("Failed to load exercises");
  }

  return response.json();
}

export async function fetchExerciseById(id: string): Promise<Exercise> {
  const response = await fetch(`${API_BASE_URL}/exercises/${id}`);

  if (!response.ok) {
    throw new Error(`Exercise not found: ${id}`);
  }

  return response.json();
}

export async function createExercise(
   name: string,
   muscleGroup: string
 ): Promise<Exercise> {
   const response = await fetch(`${API_BASE_URL}/exercises`, {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ name, muscleGroup }),
   });

   if (!response.ok) {
     throw new Error("Failed to create exercise");
   }

   return response.json();
 }