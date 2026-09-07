import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchGoalById, deleteGoal } from "../../api/goalApi";
import { goalProgressFactory } from "../../utils/goalProgress";
import { usePreferences } from "../../context/PreferencesContext";
import type { Goal } from "../../types/goal";

export default function GoalDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = usePreferences();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchGoalById(id)
      .then(setGoal)
      .catch(() => setError("Goal not found."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setShowDeleteModal(false);
    setDeleting(true);
    try {
      await deleteGoal(id);
      navigate("/goals");
    } catch {
      alert("Failed to delete goal.");
      setDeleting(false);
    }
  };

  const pct = goal ? goalProgressFactory().calculate(goal) : 0;
  const isDone = pct >= 100;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 64 }}>
      <div className="back-link" onClick={() => navigate("/goals")}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {t("goals").toUpperCase()}
      </div>

      {loading && <div style={{ color: "var(--muted)", margin: "40px 0", fontFamily: "var(--mono)" }}>[ {t("goals").toUpperCase()}... ]</div>}
      {error && <div style={{ color: "var(--danger)", margin: "40px 0", fontFamily: "var(--mono)" }}>[ ERR: {error} ]</div>}

      {goal && (
        <>
          <div className="page-head" style={{ borderBottom: "none", paddingBottom: 0, marginBottom: 32 }}>
            <div>
              <div style={{ fontSize: 13, color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.1em", marginBottom: 8 }}>{t("detail").toUpperCase()}</div>
              <h1 className="page-title">{goal.exerciseName}</h1>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={deleting}
              className="btn"
              style={{ background: "var(--danger-glow)", color: "var(--danger)", border: "1px solid var(--danger)", padding: "10px 18px" }}
            >
              {deleting ? "..." : t("deleteGoal")}
            </button>
          </div>

          <div className="card" style={{ borderTop: `4px solid ${isDone ? "var(--success)" : "var(--accent)"}`, marginBottom: 32, padding: 32 }}>
            <div className="goal-stats-row" style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 48, flexWrap: "wrap", textAlign: "center" }}>
              <div style={{ flex: "1 1 200px", minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.05em", marginBottom: 12 }}>{t("target").toUpperCase()}</div>
                <div className="score-cell active" style={{ fontSize: 32, padding: "12px 24px", background: isDone ? "var(--success-glow)" : "var(--accent-glow)", color: isDone ? "var(--success)" : "var(--accent)", boxShadow: `inset 0 0 0 1px ${isDone ? "var(--success)" : "var(--accent)"}` }}>{goal.targetWeightKg}kg × {goal.targetReps}</div>
              </div>
              <div style={{ flex: "1 1 200px", minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.05em", marginBottom: 12 }}>{t("progression").toUpperCase()}</div>
                <div className="score-cell" style={{ fontSize: 32, padding: "12px 24px" }}>
                  {goal.currentWeightKg != null ? `${goal.currentWeightKg}kg × ${goal.currentReps}` : "--"}
                </div>
              </div>
            </div>

            <>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontFamily: "var(--mono)", fontWeight: 700, color: isDone ? "var(--success)" : "var(--accent)", marginBottom: 12 }}>
                <span style={{ letterSpacing: "0.1em" }}>{t("progression").toUpperCase()}</span>
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
                  [ {t("completed").toUpperCase()} ]
                </div>
              )}
            </>
          </div>

          <div className="card" style={{ padding: 32 }}>
            <h3 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", fontWeight: 700, marginBottom: 24, fontFamily: "var(--mono)" }}>{t("details").toUpperCase()}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--border)", paddingBottom: 12 }}>
                <span style={{ color: "var(--muted)", fontSize: 13, fontFamily: "var(--mono)", letterSpacing: "0.05em" }}>{t("created").toUpperCase()}</span>
                <span style={{ color: "var(--ink)", fontSize: 13, fontWeight: 700, fontFamily: "var(--mono)" }}>{new Date(goal.createdAt).toLocaleDateString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--border)", paddingBottom: 12 }}>
                <span style={{ color: "var(--muted)", fontSize: 13, fontFamily: "var(--mono)", letterSpacing: "0.05em" }}>{t("deadline").toUpperCase()}</span>
                <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--mono)", color: goal.targetDate ? "var(--ink)" : "var(--muted)" }}>{goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : t("none").toUpperCase()}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {showDeleteModal && (
        <div className="modal-backdrop" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 999, display: "flex", justifyContent: "center", alignItems: "center", padding: 24 }}>
          <div className="modal-card" style={{ width: "100%", maxWidth: 420, background: "var(--card)", border: "1px solid var(--danger)", borderRadius: 8, padding: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: "var(--danger)", fontFamily: "var(--mono)", letterSpacing: "0.05em" }}>{t("deleteGoal")}?</h2>
            <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24, lineHeight: 1.5 }}>
              {t("deleteGoalMsg")}
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-outline">{t("cancel")}</button>
              <button onClick={handleDelete} className="btn" style={{ background: "var(--danger)", color: "var(--bg)", border: "none" }}>{t("deleteGoal")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
