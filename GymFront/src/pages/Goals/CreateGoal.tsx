import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllExercises } from "../../api/exerciseApi";
import { createGoal } from "../../api/goalApi";
import type { Exercise } from "../../types/exercise";

export default function CreateGoal() {
  const navigate = useNavigate();
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
      .catch(() => setError("Não foi possível carregar os exercícios."));
  }, []);

  const submit = () => {
    if ( !exerciseId || !targetWeightKg || !targetReps) {
      setError("Preencha exercício, peso e reps alvo.");
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
      .catch(() => setError("Não foi possível criar a meta."))
      .finally(() => setSaving(false));
  };

  return (
    <>
      <div className="back-link" onClick={() => navigate("/goals")}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Goals
      </div>

      <div className="page-head">
        <div>
          <h1 className="page-title">Create Performance Goal</h1>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        

        <div className="field">
          <label>Exercise</label>
          <select value={exerciseId} onChange={(e) => setExerciseId(e.target.value)}>
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Target weight (kg)</label>
            <input
              type="number"
              value={targetWeightKg}
              onChange={(e) => setTargetWeightKg(e.target.value)}
              placeholder="100"
            />
          </div>
          <div className="field">
            <label>Target reps</label>
            <input
              type="number"
              value={targetReps}
              onChange={(e) => setTargetReps(e.target.value)}
              placeholder="5"
            />
          </div>
        </div>

        <div className="field">
          <label>Target date (optional)</label>
          <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
        </div>

        {error && <p style={{ color: "var(--pink)" }}>{error}</p>}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
          <button className="btn btn-ghost" onClick={() => navigate("/goals")}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={submit}>
            {saving ? "Creating..." : "Create Goal"}
          </button>
        </div>
      </div>
    </>
  );
}