import type { WorkoutResponse } from "../types/workout";

const API_BASE_URL = "http://localhost:8080/api";

export async function fetchWorkoutById(workoutId: string): Promise<WorkoutResponse> {
  const response = await fetch(`${API_BASE_URL}/workouts/${workoutId}`);

  if (!response.ok) {
    throw new Error(`Workout not found: ${workoutId}`);
  }

  return response.json();
}