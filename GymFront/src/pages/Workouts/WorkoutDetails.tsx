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
              <h1 className="page-title">{workout.name}</h1>
              <p className="page-sub">Aluno: {workout.memberName}</p>
            </div>
          </div>

          {workout.exercises.map((exercise, i) => (
            <div className="card" key={i} style={{ marginBottom: 16 }}>
              <div className="card-head">
                <div className="card-title">{exercise.exerciseName}</div>
                <span className="chip">{exercise.executionGuidance}</span>
              </div>
              {exercise.notes && (
                <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 10 }}>{exercise.notes}</p>
              )}
              <table>
                <thead>
                  <tr><th>Set</th><th>Reps</th><th>Weight</th></tr>
                </thead>
                <tbody>
                  {exercise.sets.map((set) => (
                    <tr key={set.setNumber}>
                      <td>{set.setNumber}</td>
                      <td>{set.reps}</td>
                      <td>{set.weightKg} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </>
      )}
    </>
  );
}