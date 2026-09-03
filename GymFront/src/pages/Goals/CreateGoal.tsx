import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllExercises } from "../../api/exerciseApi";
import { createGoal } from "../../api/goalApi";
import { usePreferences } from "../../context/PreferencesContext";
import type { Exercise } from "../../types/exercise";

export default function CreateGoal() {
  const navigate = useNavigate();
  const { t } = usePreferences();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseId, setExerciseId] = useState("");
  const [targetWeightKg, setTargetWeightKg] = useState("");
  const [targetReps, setTargetReps] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAllExercises()
      .then((list) => {
        setExercises(list);
        if (list.length > 0) setExerciseId(list[0].id);
      })
      .catch(() => setError("Failed to load exercises."));
  }, []);

  const submit = () => {
    if (!exerciseId || !targetWeightKg || !targetReps) {
      setError("Please fill all required fields.");
      return;
    }
    setSaving(true);
    setError(null);
    createGoal({
      exerciseId,
      targetWeightKg: Number(targetWeightKg),
      targetReps: Number(targetReps),
      targetDate: targetDate || null,
    })
      .then(() => navigate("/goals"))
      .catch(() => setError("Failed to create goal."))
      .finally(() => setSaving(false));
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div className="back-link" onClick={() => navigate("/goals")}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        GOALS
      </div>

      <div className="page-head" style={{ marginBottom: 32 }}>
        <div>
          <h1 className="page-title">{t("newTarget").toUpperCase()}</h1>
          <p className="page-sub">ESTABLISH PERFORMANCE OBJECTIVE</p>
        </div>
      </div>

      <div className="card" style={{ padding: 32 }}>
        <div className="field">
          <label>{t("target").toUpperCase()} ({t("exercises").toUpperCase()})</label>
          <select value={exerciseId} onChange={(e) => setExerciseId(e.target.value)} style={{ textTransform: "uppercase" }}>
            {exercises.map((e) => (
              <option key={e.id} value={e.id}>{e.name} ({e.muscleGroup})</option>
            ))}
          </select>
        </div>

        <div className="field-row">
          <div className="field" style={{ flex: 1 }}>
            <label>{t("target").toUpperCase()} (KG)</label>
            <input
              type="number"
              placeholder="e.g. 100.0"
              value={targetWeightKg}
              onChange={(e) => setTargetWeightKg(e.target.value)}
              className="score-input"
              style={{ background: "var(--faint)", textAlign: "left", padding: "12px 16px" }}
            />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>{t("target").toUpperCase()} REPS</label>
            <input
              type="number"
              placeholder="e.g. 5"
              value={targetReps}
              onChange={(e) => setTargetReps(e.target.value)}
              className="score-input"
              style={{ background: "var(--faint)", textAlign: "left", padding: "12px 16px" }}
            />
          </div>
        </div>

        <div className="field" style={{ marginBottom: 40 }}>
          <label>DEADLINE (OPTIONAL)</label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            style={{ color: "var(--muted)", fontFamily: "var(--mono)" }}
          />
        </div>

        {error && <p style={{ color: "var(--danger)", marginBottom: 24, fontSize: 13, fontFamily: "var(--mono)", background: "var(--danger-glow)", padding: 12, borderRadius: 4 }}>[ ERR: {error} ]</p>}

        <button className="btn btn-primary" onClick={submit} disabled={saving} style={{ width: "100%", padding: 16, fontSize: 14 }}>
          {saving ? "SAVING..." : "SAVE"}
        </button>
      </div>
    </div>
  );
}
