import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchGoalsByMember } from "../../api/goalApi";
import { goalProgressFactory } from "../../utils/goalProgress";
import type { Goal } from "../../types/goal";

export default function Goals() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoalsByMember()
      .then(setGoals)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 64 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, marginTop: 16, borderBottom: "1px solid var(--border)", paddingBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.04em", textTransform: "uppercase", lineHeight: 1 }}>TARGET OBJECTIVES</h1>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate("/goals/create")}
          style={{ padding: "12px 24px", fontSize: 14 }}
        >
          + NEW TARGET
        </button>
      </div>

      {loading && <div style={{ color: "var(--muted)", fontFamily: "var(--mono)" }}>[ LOADING TARGETS... ]</div>}

      {goals && goals.length === 0 && <div className="card" style={{ fontFamily: "var(--mono)", color: "var(--muted)" }}>[ NO ACTIVE TARGETS ESTABLISHED ]</div>}

      {goals && goals.length > 0 && (
        <>
          <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", fontWeight: 700, marginBottom: 16 }}>ACTIVE TARGETS</div>
          <div className="grid g-3">
            {goals.map((goal) => {
              const pct = goalProgressFactory().calculate(goal);
              return (
                <div 
                  key={goal.id} 
                  className="card"
                  onClick={() => navigate(`/goals/${goal.id}`)}
                  style={{ cursor: "pointer", transition: "all 0.2s", borderTop: pct >= 100 ? "4px solid var(--success)" : "4px solid var(--accent)", display: "flex", flexDirection: "column", padding: 24 }}
                >
                  <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4, textTransform: "uppercase", color: "var(--ink)" }}>{goal.exerciseName}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", fontFamily: "var(--mono)", marginBottom: 16, letterSpacing: "0.05em" }}>
                    TGT: <span style={{ color: "var(--ink)" }}>{goal.targetWeightKg}KG x {goal.targetReps}</span>
                  </div>
                  
                  <div style={{ background: "var(--faint)", height: 6, borderRadius: 3, overflow: "hidden", marginBottom: 12 }}>
                    <div style={{ 
                      height: "100%", 
                      width: `${Math.min(pct, 100)}%`, 
                      background: pct >= 100 ? "var(--success)" : "var(--accent)",
                      boxShadow: pct >= 100 ? "0 0 8px var(--success-glow)" : "0 0 8px var(--accent-glow)"
                    }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontFamily: "var(--mono)", fontWeight: 700, color: pct >= 100 ? "var(--success)" : "var(--accent)" }}>
                    <span className="score-cell active" style={{ padding: "2px 8px", fontSize: 13, background: pct >= 100 ? "var(--success-glow)" : "var(--accent-glow)", color: pct >= 100 ? "var(--success)" : "var(--accent)", boxShadow: "none" }}>{pct.toFixed(1)}%</span>
                    <span style={{ fontSize: 11, letterSpacing: "0.1em" }}>{pct >= 100 ? "COMPLETED" : "IN PROGRESS"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
