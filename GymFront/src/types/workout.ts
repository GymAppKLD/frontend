export interface WorkoutSet {
  setNumber: number;
  reps: number;
  weightKg: number;
}

export interface WorkoutExercise {
  id: string;
  exerciseName: string;
  targetMuscles: string;
  notes: string | null;
  technique: string;
  executionGuidance: string;
  weeklyVolume: number;
  sets: WorkoutSet[];
}

export interface WorkoutResponse {
  name: string;
  memberName: string;
  createdAt: string;
  status: string;
  isTemplate: boolean;
  exercises: WorkoutExercise[];
}

export interface WorkoutSummary {
  id: string;
  name: string;
  memberName: string;
  createdAt: string;
  status: string;
  isTemplate: boolean;
  exerciseCount: number;
}