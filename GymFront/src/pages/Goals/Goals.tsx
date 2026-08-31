import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchGoalsByMember } from "../../api/goalApi";
import { goalProgressFactory } from "../../utils/goalProgress";
import type { Goal } from "../../types/goal";

export default function Goals() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[] | null>(null);

  useEffect(() => {
    fetchGoalsByMember()
      .then(setGoals)
      .catch(() => {});
  }, []);

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Goals</h1>
          <p className="page-sub">Set performance targets and track your progress</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/goals/create")}>
          + New Goal
        </button>
      </div>

      

      {goals && goals.length === 0 && <div className="card">Nenhuma meta cadastrada ainda.</div>}

      {goals && goals.length > 0 && (
        <>
          <div className="section-label">Active Goals</div>
          {goals.map((goal) => {
            const pct = goalProgressFactory().calculate(goal);
            return (
              <div className="goal-card" key={goal.id} onClick={() => navigate(`/goals/${goal.id}`)}>
                <div className="goal-top">
                  <div>
                    <div className="goal-name">{goal.exerciseName}</div>
                    <div className="goal-target">
                      Reach {goal.targetWeightKg} kg × {goal.targetReps}
                    </div>
                  </div>
                  <div className="goal-pct">{pct}%</div>
                </div>
                <div className="pbar">
                  <div className="pbar-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="goal-current">
                  <span>
                    Current:{" "}
                    {goal.currentWeightKg != null
                      ? `${goal.currentWeightKg} kg × ${goal.currentReps}`
                      : "Not logged yet"}
                  </span>
                  <span
                    className="link-arrow"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/goals/${goal.id}`);
                    }}
                  >
                    View →
                  </span>
                </div>
              </div>
            );
          })}
        </>
      )}
    </>
  );
}