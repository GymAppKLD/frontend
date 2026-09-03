export interface ProgressPointDTO {
  date: string;
  volumeKg: number;
}

export interface SessionSummaryDTO {
  date: string;
  volumeKg: number;
  totalReps: number;
  bestSetWeightKg: number;
  bestSetReps: number;
}

export interface ExerciseProgressDTO {
  exerciseId: string;
  exerciseName: string;
  latestWeightKg: number;
  latestReps: number;
  bestWeightKg: number;
  bestReps: number;
  estimated1Rm: number;
  progressPct: number;
  points: ProgressPointDTO[];
  sessions: SessionSummaryDTO[];
}

export interface PriorityExerciseDTO {
  exerciseName: string;
  muscleGroup: string;
  volumeKg: number;
  progressPct: number;
  points: number[];
}

export interface DashboardStatsDTO {
  workoutsThisMonth: number;
  totalVolumeKg: number;
  averageLoadKg: number;
  overallProgressPct: number;
  priorityExercises: PriorityExerciseDTO[];
  weeklyVolumePerMuscle: Record<string, number>;
  averageLoadPerExercise: Record<string, number>;
}

export interface WeeklyVolumeDTO {
  week: string;
  muscleGroup: string;
  volumeSets: number;
}

export interface ExerciseProgressSummaryDTO {
  exerciseName: string;
  progressPct: number;
  points: number[];
}

export interface ProgressOverviewDTO {
  weeklyVolume: WeeklyVolumeDTO[];
  exercises: ExerciseProgressSummaryDTO[];
}
