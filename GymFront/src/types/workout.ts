export interface WorkoutExercise {
  exerciseName: string;
  sets: number;
  reps: number;
  weightKg: number;
  notes: string | null;
  technique: string;
  executionGuidance: string;
}

export interface WorkoutResponse {
  name: string;
  memberName: string;
  exercises: WorkoutExercise[];
}