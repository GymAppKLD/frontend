import type { Goal, GoalType } from "../types/goal";

export interface GoalProgressStrategy {
  calculate(goal: Goal): number;
}

class WeightRepsProgressStrategy implements GoalProgressStrategy {
  calculate(goal: Goal): number {
    if (goal.currentWeightKg == null || goal.currentReps == null) return 0;
    const targetLoad = goal.targetWeightKg * goal.targetReps;
    const currentLoad = goal.currentWeightKg * goal.currentReps;
    if (targetLoad <= 0) return 0;
    return Math.min(100, Math.round((currentLoad / targetLoad) * 100));
  }
}

const strategies: Record<GoalType, GoalProgressStrategy> = {
  WEIGHT_REPS: new WeightRepsProgressStrategy(),
};

export function goalProgressFactory(type: GoalType = "WEIGHT_REPS"): GoalProgressStrategy {
  return strategies[type];
}