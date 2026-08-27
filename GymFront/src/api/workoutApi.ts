import type { WorkoutResponse, WorkoutSummary } from "../types/workout";

const API_BASE_URL = "http://localhost:8080/api";

interface RawWorkoutExercise {
  id: string;
}

interface RawWorkout {
  id: string;
  exercises: RawWorkoutExercise[];
}

export async function fetchWorkoutById(workoutId: string): Promise<WorkoutResponse> {
  const response = await fetch(`${API_BASE_URL}/workouts/${workoutId}`);

  if (!response.ok) {
    throw new Error(`Workout not found: ${workoutId}`);
  }

  return response.json();
}

export async function fetchAllWorkouts(memberId?: string): Promise<WorkoutSummary[]> {
  const url = memberId
    ? `${API_BASE_URL}/workouts?memberId=${memberId}`
    : `${API_BASE_URL}/workouts`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to load workouts");
  }

  return response.json();
}

export async function createWorkout(
  name: string,
  memberId: string
): Promise<{ id: string }> {
  const response = await fetch(`${API_BASE_URL}/workouts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, memberId }),
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ exerciseId, technique, notes }),
  });

  if (!response.ok) {
    throw new Error("Failed to add exercise to workout");
  }

  const workout: RawWorkout = await response.json();
  const lastExercise = workout.exercises[workout.exercises.length - 1];
  return { workoutExerciseId: lastExercise.id };
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reps, weightKg }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to add set");
  }
}