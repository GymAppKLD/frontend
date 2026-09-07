import type { Exercise } from "../types/exercise";
import { getAuthHeaders } from "./apiClient";
import type { ExerciseProgressDTO } from "../types/progress";

const API_BASE_URL = "/api";

export async function fetchAllExercises(): Promise<Exercise[]> {
  const response = await fetch(`${API_BASE_URL}/exercises`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to load exercises");
  }

  return response.json();
}

export async function fetchExerciseById(id: string): Promise<Exercise> {
  const response = await fetch(`${API_BASE_URL}/exercises/${id}`, {
    headers: getAuthHeaders(),
  });

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
     headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
     body: JSON.stringify({ name, muscleGroup }),
   });

   if (!response.ok) {
     throw new Error("Failed to create exercise");
   }

   return response.json();
}

export async function fetchExerciseProgress(exerciseId: string): Promise<ExerciseProgressDTO> {
  const response = await fetch(`${API_BASE_URL}/exercises/${exerciseId}/progress`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to load progress for exercise: ${exerciseId}`);
  }

  return response.json();
}

export interface PreviousNote {
  date: string;
  daysElapsed: number;
  note: string | null;
  bestWeightKg: number | null;
  bestReps: number | null;
  setsCount: number;
}

export async function fetchPreviousNote(exerciseId: string): Promise<PreviousNote | null> {
  const res = await fetch(`${API_BASE_URL}/exercises/${exerciseId}/previous-note`, {
    headers: getAuthHeaders(),
  });
  if (res.status === 204) return null;
  if (!res.ok) return null;
  return res.json();
}
