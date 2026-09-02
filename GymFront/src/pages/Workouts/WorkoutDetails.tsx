import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchWorkoutById } from "../../api/workoutApi";
import type { WorkoutResponse } from "../../types/workout";

export default function WorkoutDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<WorkoutResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchWorkoutById(id).then(setWorkout).catch(() => setError("WORKOUT NOT FOUND")).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)", fontFamily: "var(--mono)" }}>[ FETCHING ARCHIVE... ]</div>;
  if (error) return <div style={{ padding: 40, textAlign: "center", color: "var(--danger)", fontFamily: "var(--mono)" }}>[ ERR: {error} ]</div>;
  if (!workout) return null;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", paddingBottom: 64 }}>
      <div className="back-link" onClick={() => navigate("/workouts")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg> WORKOUTS</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, marginTop: 16, borderBottom: "1px solid var(--border)", paddingBottom: 24 }}>
        <div><div style={{ fontSize: 13, color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.1em", marginBottom: 8 }}>ARCHIVE // {workout.status}</div><h1 style={{ fontSize: 40, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.04em", textTransform: "uppercase", lineHeight: 1 }}>{workout.name}</h1></div>
        <div className="score-cell" style={{ fontSize: 11 }}>{new Date(workout.createdAt).toLocaleDateString()}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {workout.exercises.map((ex, i) => {
          return (
            <div key={i} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{String(i+1).padStart(2,'0')} - {ex.exerciseName}</div>
                <span className="score-cell active" style={{ fontSize: 11 }}>{ex.weeklyVolume} SETS/WK</span>
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)", fontFamily: "var(--mono)", marginBottom: 16 }}>TARGET: {ex.targetMuscles || "--"}</div>

              {ex.notes && (
                <div style={{ marginBottom: 12, padding: "12px 16px", background: "var(--faint)", borderRadius: 4, borderLeft: "2px solid var(--accent)", fontSize: 13 }}>
                  <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.1em", marginBottom: 4 }}>ORIENTATION</div>
                  <div>{ex.notes}</div>
                </div>
              )}

              {ex.logNotes && (
                <div style={{ marginBottom: 16, padding: "12px 16px", background: "var(--bg)", border: "1px dashed var(--border)", borderRadius: 4, borderLeft: "2px solid var(--info)", fontSize: 13 }}>
                  <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.1em", marginBottom: 4 }}>SESSION NOTE</div>
                  <div style={{ color: "var(--ink)" }}>{ex.logNotes}</div>
                </div>
              )}

              {ex.sets.length > 0 && <table style={{ marginTop: 16 }}><thead><tr><th>SET</th><th>LOAD</th><th>REPS</th></tr></thead><tbody>{ex.sets.map(s => <tr key={s.setNumber}><td><span className="score-cell" style={{ fontSize: 12 }}>{s.setNumber}</span></td><td style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>{s.weightKg} KG</td><td style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>{s.reps}</td></tr>)}</tbody></table>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
