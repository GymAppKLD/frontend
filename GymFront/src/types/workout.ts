export interface WorkoutSet {
  setNumber: number;
  reps: number;
  weightKg: number;
}

export interface WorkoutExercise {
  exerciseName: string;
  notes: string | null;
  technique: string;
  executionGuidance: string;
  sets: WorkoutSet[];
}

export interface WorkoutResponse {
  name: string;
  memberName: string;
  exercises: WorkoutExercise[];
}

export interface WorkoutSummary {
  id: string;
  name: string;
  memberName: string;
  createdAt: string;
  exerciseCount: number;
}