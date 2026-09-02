import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchGoalById } from "../../api/goalApi";
import { goalProgressFactory } from "../../utils/goalProgress";
import type { Goal } from "../../types/goal";

export default function GoalDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchGoalById(id)
      .then(setGoal)
      .catch(() => setError("Goal not found."))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 64 }}>
      <div className="back-link" onClick={() => navigate("/goals")}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        GOALS
      </div>

      {loading && <div style={{ color: "var(--muted)", margin: "40px 0", fontFamily: "var(--mono)" }}>[ LOADING TARGET DATA... ]</div>}
      {error && <div style={{ color: "var(--danger)", margin: "40px 0", fontFamily: "var(--mono)" }}>[ ERR: {error} ]</div>}

      {goal && (
        <>
          <div className="page-head" style={{ borderBottom: "none", paddingBottom: 0, marginBottom: 32 }}>
            <div>
              <div style={{ fontSize: 13, color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.1em", marginBottom: 8 }}>TARGET DETAIL</div>
              <h1 className="page-title">{goal.exerciseName}</h1>
            </div>
          </div>

          <div className="card" style={{ borderTop: "4px solid var(--accent)", marginBottom: 32, padding: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 48 }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.05em", marginBottom: 12 }}>TARGET SPEC</div>
                <div className="score-cell active" style={{ fontSize: 32, padding: "12px 24px" }}>{goal.targetWeightKg}kg × {goal.targetReps}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.05em", marginBottom: 12 }}>CURRENT STATE</div>
                <div className="score-cell" style={{ fontSize: 32, padding: "12px 24px" }}>
                  {goal.currentWeightKg != null ? `${goal.currentWeightKg}kg × ${goal.currentReps}` : "--"}
                </div>
              </div>
            </div>

            {(() => {
              const pct = goalProgressFactory().calculate(goal);
              const isDone = pct >= 100;
              return (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontFamily: "var(--mono)", fontWeight: 700, color: isDone ? "var(--success)" : "var(--accent)", marginBottom: 12 }}>
                    <span style={{ letterSpacing: "0.1em" }}>PROGRESSION</span>
                    <span style={{ fontSize: 14 }}>{pct.toFixed(1)}%</span>
                  </div>
                  <div style={{ background: "var(--faint)", height: 16, borderRadius: 8, overflow: "hidden" }}>
                    <div style={{ 
                      height: "100%", 
                      width: `${Math.min(pct, 100)}%`, 
                      background: isDone ? "var(--success)" : "var(--accent)",
                      boxShadow: isDone ? "0 0 12px var(--success-glow)" : "0 0 12px var(--accent-glow)",
                      transition: "width 0.5s ease"
                    }} />
                  </div>
                  {isDone && (
                    <div style={{ marginTop: 24, color: "var(--success)", fontSize: 14, fontWeight: 800, fontFamily: "var(--mono)", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.2em", background: "var(--success-glow)", padding: 12, borderRadius: 4 }}>
                      [ TARGET ACQUIRED ]
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          <div className="card" style={{ padding: 32 }}>
            <h3 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", fontWeight: 700, marginBottom: 24, fontFamily: "var(--mono)" }}>METADATA</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--border)", paddingBottom: 12 }}>
                <span style={{ color: "var(--muted)", fontSize: 13, fontFamily: "var(--mono)", letterSpacing: "0.05em" }}>INITIALIZED</span>
                <span style={{ color: "var(--ink)", fontSize: 13, fontWeight: 700, fontFamily: "var(--mono)" }}>{new Date(goal.createdAt).toLocaleDateString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--border)", paddingBottom: 12 }}>
                <span style={{ color: "var(--muted)", fontSize: 13, fontFamily: "var(--mono)", letterSpacing: "0.05em" }}>DEADLINE</span>
                <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--mono)", color: goal.targetDate ? "var(--ink)" : "var(--muted)" }}>{goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : "NONE"}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
