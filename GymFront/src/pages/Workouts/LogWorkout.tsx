import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createWorkout, addWorkoutExercise, addSet } from "../../api/workoutApi";
import { fetchAllExercises } from "../../api/exerciseApi";
import type { Exercise } from "../../types/exercise";

const TECHNIQUES = [
  { value: "NO_TECHNIQUE", label: "No Technique" },
  { value: "DROP_SET", label: "Drop Set" },
  { value: "CLUSTER_SET", label: "Cluster Set" },
];

interface LoggedSet {
  reps: number;
  weightKg: number;
}

interface CurrentExercise {
  workoutExerciseId: string;
  exerciseName: string;
  loggedSets: LoggedSet[];
}

interface FinishedExercise {
  exerciseName: string;
  sets: LoggedSet[];
}

export default function LogWorkout() {
  const navigate = useNavigate();

  // Step 1 — create workout
  const [workoutName, setWorkoutName] = useState("");
  const [memberId, setMemberId] = useState("");
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Step 2 — pick exercise + technique/notes
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseId, setExerciseId] = useState("");
  const [technique, setTechnique] = useState("NO_TECHNIQUE");
  const [notes, setNotes] = useState("");
  const [startingExercise, setStartingExercise] = useState(false);
  const [exerciseError, setExerciseError] = useState<string | null>(null);

  // Step 3 — log sets for the current exercise
  const [current, setCurrent] = useState<CurrentExercise | null>(null);
  const [reps, setReps] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [addingSet, setAddingSet] = useState(false);
  const [setError, setSetError] = useState<string | null>(null);

  const [finished, setFinished] = useState<FinishedExercise[]>([]);

  useEffect(() => {
    fetchAllExercises().then(setExercises).catch(() => setExerciseError("Não foi possível carregar exercícios."));
  }, []);

  async function handleCreateWorkout() {
    if (!workoutName.trim() || !memberId.trim()) {
      setCreateError("Preencha nome do treino e ID do aluno.");
      return;
    }
    setCreateError(null);
    setCreating(true);
    try {
      const workout = await createWorkout(workoutName.trim(), memberId.trim());
      setWorkoutId(workout.id);
    } catch {
      setCreateError("Não foi possível criar o treino. Confira o ID do aluno.");
    } finally {
      setCreating(false);
    }
  }

  async function handleStartExercise() {
    if (!workoutId || !exerciseId) {
      setExerciseError("Selecione um exercício.");
      return;
    }
    setExerciseError(null);
    setStartingExercise(true);
    try {
      const { workoutExerciseId } = await addWorkoutExercise(
        workoutId,
        exerciseId,
        technique,
        notes.trim() || null
      );
      const exerciseName = exercises.find((e) => e.id === exerciseId)?.name ?? "Exercise";
      setCurrent({ workoutExerciseId, exerciseName, loggedSets: [] });
    } catch {
      setExerciseError("Não foi possível adicionar o exercício.");
    } finally {
      setStartingExercise(false);
    }
  }

  async function handleAddSet() {
    if (!workoutId || !current || !reps || !weightKg) {
      setSetError("Preencha reps e carga.");
      return;
    }
    setSetError(null);
    setAddingSet(true);
    try {
      await addSet(workoutId, current.workoutExerciseId, Number(reps), Number(weightKg));
      setCurrent({
        ...current,
        loggedSets: [...current.loggedSets, { reps: Number(reps), weightKg: Number(weightKg) }],
      });
      setReps("");
      setWeightKg("");
    } catch {
      setSetError("Não foi possível adicionar a série.");
    } finally {
      setAddingSet(false);
    }
  }

  function handleFinishExercise() {
    if (!current) return;
    setFinished((prev) => [...prev, { exerciseName: current.exerciseName, sets: current.loggedSets }]);
    setCurrent(null);
    setExerciseId("");
    setTechnique("NO_TECHNIQUE");
    setNotes("");
  }

  return (
    <>
      <div className="back-link" onClick={() => navigate("/workouts")}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Workouts
      </div>

      <div className="page-head">
        <div>
          <h1 className="page-title">Log Workout</h1>
          <p className="page-sub">Record a training session, set by set</p>
        </div>
      </div>

      {/* Step 1 */}
      {!workoutId && (
        <div className="card" style={{ maxWidth: 560 }}>
          <div className="field">
            <label>Workout name</label>
            <input value={workoutName} onChange={(e) => setWorkoutName(e.target.value)} placeholder="e.g. Push Day" />
          </div>
          <div className="field">
            <label>Member ID (UUID)</label>
            <input value={memberId} onChange={(e) => setMemberId(e.target.value)} placeholder="Cole o UUID do aluno" />
          </div>
          {createError && <p style={{ color: "var(--pink)", fontSize: 13 }}>{createError}</p>}
          <button className="btn btn-primary" onClick={handleCreateWorkout} disabled={creating}>
            {creating ? "Creating..." : "Start Workout"}
          </button>
        </div>
      )}

      {/* Step 2 — pick next exercise (only when not mid-exercise) */}
      {workoutId && !current && (
        <div className="card" style={{ maxWidth: 560, marginBottom: 18 }}>
          <div className="card-title" style={{ marginBottom: 10 }}>Add Exercise</div>
          <div className="field">
            <label>Exercise</label>
            <select value={exerciseId} onChange={(e) => setExerciseId(e.target.value)}>
              <option value="">Select an exercise</option>
              {exercises.map((ex) => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Technique</label>
            <select value={technique} onChange={(e) => setTechnique(e.target.value)}>
              {TECHNIQUES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
          {exerciseError && <p style={{ color: "var(--pink)", fontSize: 13 }}>{exerciseError}</p>}
          <button className="btn btn-primary" onClick={handleStartExercise} disabled={startingExercise}>
            {startingExercise ? "Adding..." : "Start Logging Sets"}
          </button>
        </div>
      )}

      {/* Step 3 — log sets for current exercise */}
      {workoutId && current && (
        <div className="card" style={{ maxWidth: 560, marginBottom: 18 }}>
          <div className="card-title" style={{ marginBottom: 10 }}>{current.exerciseName}</div>

          {current.loggedSets.length > 0 && (
            <table style={{ marginBottom: 14 }}>
              <thead>
                <tr><th>Set</th><th>Reps</th><th>Weight</th></tr>
              </thead>
              <tbody>
                {current.loggedSets.map((s, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{s.reps}</td>
                    <td>{s.weightKg} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="field-row">
            <div className="field">
              <label>Reps</label>
              <input type="number" value={reps} onChange={(e) => setReps(e.target.value)} />
            </div>
            <div className="field">
              <label>Weight (kg)</label>
              <input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
            </div>
          </div>
          {setError && <p style={{ color: "var(--pink)", fontSize: 13 }}>{setError}</p>}

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary" onClick={handleAddSet} disabled={addingSet}>
              {addingSet ? "Adding..." : `+ Add Set ${current.loggedSets.length + 1}`}
            </button>
            <button
              className="btn btn-ghost"
              onClick={handleFinishExercise}
              disabled={current.loggedSets.length === 0}
            >
              Finish Exercise
            </button>
          </div>
        </div>
      )}

      {/* Summary of completed exercises */}
      {finished.length > 0 && (
        <div className="card" style={{ maxWidth: 560, marginBottom: 18 }}>
          <div className="card-title" style={{ marginBottom: 10 }}>Completed this workout</div>
          {finished.map((f, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <strong>{f.exerciseName}</strong> — {f.sets.length} sets
            </div>
          ))}
        </div>
      )}

      {workoutId && !current && finished.length > 0 && (
        <button className="btn btn-ghost" onClick={() => navigate(`/workouts/${workoutId}`)}>
          Finish → View Workout
        </button>
      )}
    </>
  );
}