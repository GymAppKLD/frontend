import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchGoalById } from "../../api/goalApi";
import { goalProgressFactory } from "../../utils/goalProgress";
import type { Goal } from "../../types/goal";

function Donut({ pct }: { pct: number }) {
  const size = 150;
  const thickness = 14;
  const r = (size - thickness) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  const len = circ * (pct / 100);

  return (
    <div className="donut-wrap" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth={thickness}
        />
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke="var(--purple)"
          strokeWidth={thickness}
          strokeDasharray={`${len} ${circ - len}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${c} ${c})`}
        />
      </svg>
      <div className="donut-center">
        <div className="v">{pct}%</div>
        <div className="l">of target</div>
      </div>
    </div>
  );
}

export default function GoalDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchGoalById(id)
      .then(setGoal)
      .catch(() => setError("Meta não encontrada."));
  }, [id]);

  return (
    <>
      <div className="back-link" onClick={() => navigate("/goals")}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Goals
      </div>

      {error && <div className="card">{error}</div>}

      {goal && (
        <>
          <div className="page-head">
            <div>
              <h1 className="page-title">{goal.exerciseName} Goal</h1>
              <p className="page-sub">
                Reach {goal.targetWeightKg} kg × {goal.targetReps}
              </p>
            </div>
          </div>

          <div
            className="card"
            style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 26, flexWrap: "wrap" }}
          >
            <Donut pct={goalProgressFactory().calculate(goal)} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div className="settings-row">
                <span className="label">Current</span>
                <span className="value mono-num" style={{ color: "var(--ink)" }}>
                  {goal.currentWeightKg != null
                    ? `${goal.currentWeightKg} kg × ${goal.currentReps}`
                    : "Not logged yet"}
                </span>
              </div>
              <div className="settings-row">
                <span className="label">Target</span>
                <span className="value mono-num" style={{ color: "var(--ink)" }}>
                  {goal.targetWeightKg} kg × {goal.targetReps}
                </span>
              </div>
              <div className="settings-row">
                <span className="label">Started</span>
                <span className="value">{new Date(goal.createdAt).toLocaleDateString()}</span>
              </div>
              {goal.targetDate && (
                <div className="settings-row">
                  <span className="label">Target date</span>
                  <span className="value">{new Date(goal.targetDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}