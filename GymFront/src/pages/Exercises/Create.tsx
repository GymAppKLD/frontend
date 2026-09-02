import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createExercise } from "../../api/exerciseApi";

const MUSCLE_GROUPS = [
  "Chest", "Back", "Legs", "Shoulders", "Biceps", "Triceps", "Core", "Full Body"
];

export default function Create() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState(MUSCLE_GROUPS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    createExercise(name.trim(), muscleGroup)
      .then(() => navigate("/exercises"))
      .catch(() => setError("Failed to create exercise."))
      .finally(() => setLoading(false));
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", paddingBottom: 64 }}>
      <div className="back-link" onClick={() => navigate("/exercises")}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        DATABASE
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, marginTop: 16, borderBottom: "1px solid var(--border)", paddingBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.04em", textTransform: "uppercase", lineHeight: 1 }}>NEW EXERCISE</h1>
        </div>
      </div>

      <div className="card" style={{ padding: 40 }}>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>MODULE DESIGNATION</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. INCLINE PRESS"
              required
              className="score-input"
              style={{ background: "var(--faint)", textAlign: "left", padding: "16px 24px" }}
            />
          </div>

          <div className="field" style={{ marginBottom: 40 }}>
            <label>PRIMARY VECTOR</label>
            <select
              value={muscleGroup}
              onChange={(e) => setMuscleGroup(e.target.value)}
              className="score-input"
              style={{ background: "var(--faint)", textAlign: "left", padding: "16px 24px", color: "var(--ink)" }}
            >
              {MUSCLE_GROUPS.map((mg) => (
                <option key={mg} value={mg}>{mg}</option>
              ))}
            </select>
          </div>

          {error && <p style={{ color: "var(--danger)", marginBottom: 24, fontSize: 13, fontFamily: "var(--mono)", background: "var(--danger-glow)", padding: 12, borderRadius: 2 }}>[ ERR: {error} ]</p>}

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", padding: 24, fontSize: 16, letterSpacing: "0.1em" }}>
            {loading ? "SAVING..." : "SAVE"}
          </button>
        </form>
      </div>
    </div>
  );
}
