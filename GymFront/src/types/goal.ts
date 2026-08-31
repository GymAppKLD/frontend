export type GoalType = "WEIGHT_REPS";

export interface Goal {
  id: string;
  exerciseId: string;
  exerciseName: string;
  targetWeightKg: number;
  targetReps: number;
  targetDate: string | null;
  createdAt: string;
  currentWeightKg: number | null;
  currentReps: number | null;
}

export interface CreateGoalPayload {
  exerciseId: string;
  targetWeightKg: number;
  targetReps: number;
  targetDate: string | null;
}