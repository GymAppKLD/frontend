import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createExercise } from "../../api/exerciseApi";

export default function Create() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!name.trim() || !muscleGroup.trim()) {
      setError("Preencha nome e grupo muscular.");
      return;
    }

    setError(null);
    setSaving(true);

    try {
      await createExercise(name.trim(), muscleGroup.trim());
      navigate("/exercises");
    } catch {
      setError("Não foi possível criar o exercício.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div
        className="back-link"
        onClick={() => navigate("/exercises")}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Exercises
      </div>

      <div className="page-head">
        <div>
          <h1 className="page-title">Create Exercise</h1>
          <p className="page-sub">Add a new exercise to your library</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        <div className="field">
          <label>Exercise name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cable Lateral Raise" />
        </div>
        <div className="field">
          <label>Muscle group</label>
          <input value={muscleGroup} onChange={(e) => setMuscleGroup(e.target.value)} placeholder="e.g. Deltoid" />
        </div>

        {error && <p style={{ color: "var(--pink)", fontSize: 13 }}>{error}</p>}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
          <button className="btn btn-ghost" onClick={() => navigate("/exercises")}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Creating..." : "Create Exercise"}
          </button>
        </div>
      </div>
    </>
  );
}