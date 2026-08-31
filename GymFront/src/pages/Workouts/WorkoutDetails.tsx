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
    fetchWorkoutById(id)
      .then(setWorkout)
      .catch(() => setError("Treino não encontrado."))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <>
      <div className="back-link" onClick={() => navigate("/workouts")}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Workouts
      </div>

      {loading && <div className="card">Carregando...</div>}
      {error && <div className="card">{error}</div>}

      {workout && (
        <>
          <div className="page-head">
            <div>
              <h1 className="page-title" style={{ fontSize: 24 }}>Workout: {workout.name}</h1>
              <p className="page-sub">Status: {workout.status}</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 16 }}>
            {workout.exercises.map((exercise, i) => {
              const notesList = exercise.notes 
                ? exercise.notes.split('\n').map(n => n.trim()).filter(Boolean)
                : [];
              
              if (exercise.technique && exercise.technique !== 'NO_TECHNIQUE') {
                notesList.push(exercise.executionGuidance);
              }

              return (
                <div key={i} style={{ paddingLeft: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: 18, color: "var(--ink)", marginBottom: 8 }}>
                    {i + 1}. {exercise.exerciseName}
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 16 }}>
                    <div style={{ fontSize: 15, color: "var(--muted)" }}>
                      <span style={{ fontWeight: 600 }}>Muscles:</span> {exercise.targetMuscles || "Not specified"}
                    </div>
                    
                    <div style={{ fontSize: 15, color: "var(--muted)" }}>
                      <span style={{ fontWeight: 600 }}>Weekly Volume:</span> {exercise.weeklyVolume} sets/week
                    </div>

                    {notesList.length > 0 && (
                      <div style={{ fontSize: 15, color: "var(--muted)" }}>
                        <span style={{ fontWeight: 600 }}>Orientations:</span>
                        <ul style={{ margin: "4px 0 0 0", paddingLeft: 24, listStyleType: "circle" }}>
                          {notesList.map((note, idx) => (
                            <li key={idx}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}