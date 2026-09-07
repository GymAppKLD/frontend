import type { WorkoutResponse, WorkoutSummary } from "../types/workout";
import { getAuthHeaders } from "./apiClient";

const API_BASE_URL = `${import.meta.env.VITE_API_URL ?? ""}/api`;

interface RawWorkoutExercise {
  id: string;
}

interface RawWorkout {
  id: string;
  exercises: RawWorkoutExercise[];
}

export async function fetchWorkoutById(workoutId: string): Promise<WorkoutResponse> {
  const response = await fetch(`${API_BASE_URL}/workouts/${workoutId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Workout not found: ${workoutId}`);
  }

  return response.json();
}

export async function fetchAllWorkouts(isTemplate?: boolean): Promise<WorkoutSummary[]> {
  const url = isTemplate !== undefined
    ? `${API_BASE_URL}/workouts?isTemplate=${isTemplate}`
    : `${API_BASE_URL}/workouts`;

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to load workouts");
  }

  return response.json();
}

export async function createWorkout(
  name: string,
  isTemplate: boolean = false
): Promise<{ id: string }> {
  const response = await fetch(`${API_BASE_URL}/workouts`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, isTemplate }),
  });

  if (!response.ok) {
    throw new Error("Failed to create workout");
  }

  return response.json();
}

export async function addWorkoutExercise(
  workoutId: string,
  exerciseId: string,
  technique: string,
  notes: string | null
): Promise<{ workoutExerciseId: string }> {
  const response = await fetch(`${API_BASE_URL}/workouts/${workoutId}/exercises`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ exerciseId, technique, notes }),
  });

  if (!response.ok) {
    throw new Error("Failed to add exercise to workout");
  }

  const workout: RawWorkout = await response.json();
  const lastExercise = workout.exercises[workout.exercises.length - 1];
  return { workoutExerciseId: lastExercise.id };
}

export async function updateExerciseNote(
  workoutId: string,
  workoutExerciseId: string,
  note: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/workouts/${workoutId}/exercises/${workoutExerciseId}/notes`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ note }),
    }
  );
  if (!response.ok) throw new Error("Failed to update note");
}

export async function updateExerciseLogNotes(
  workoutId: string,
  workoutExerciseId: string,
  logNotes: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/workouts/${workoutId}/exercises/${workoutExerciseId}/log-notes`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ logNotes }),
    }
  );
  if (!response.ok) throw new Error("Failed to update log notes");
}

export async function reorderExercises(workoutId: string, orderedIds: string[]): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/workouts/${workoutId}/reorder`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(orderedIds),
  });
  if (!response.ok) throw new Error("Failed to reorder");
}

export async function completeWorkout(workoutId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/workouts/${workoutId}/complete`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to complete workout");
  }
}

export async function removeWorkoutExercise(workoutId: string, workoutExerciseId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/workouts/${workoutId}/exercises/${workoutExerciseId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to remove exercise");
  }
}

export async function deleteWorkout(workoutId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/workouts/${workoutId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to delete workout");
  }
}

export async function startFromTemplate(templateId: string): Promise<{ id: string }> {
  const response = await fetch(`${API_BASE_URL}/workouts/${templateId}/start`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to start session from template");
  }

  return response.json();
}

export async function addSet(
  workoutId: string,
  workoutExerciseId: string,
  reps: number,
  weightKg: number
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/workouts/${workoutId}/exercises/${workoutExerciseId}/sets`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ reps, weightKg }),
    }
  );

  if (!response.ok) {
    const txt = await response.text().catch(() => "");
    try { const j = JSON.parse(txt); throw new Error(j.message || txt || `HTTP ${response.status}`); } catch { throw new Error(txt || `HTTP ${response.status}`); }
  }
}