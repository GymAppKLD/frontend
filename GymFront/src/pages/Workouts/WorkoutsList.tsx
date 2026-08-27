import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllWorkouts } from "../../api/workoutApi";
import type { WorkoutSummary } from "../../types/workout";

export default function WorkoutsList() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllWorkouts()
      .then(setWorkouts)
      .catch(() => setError("Não foi possível carregar os treinos."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">My Workouts</h1>
          <p className="page-sub">Record, review and manage your training sessions</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/workouts/log")}>
          + Log Workout
        </button>
      </div>

      {loading && <div className="card">Carregando...</div>}
      {error && <div className="card" style={{ color: "var(--pink)" }}>{error}</div>}

      {!loading && !error && workouts.length === 0 && (
        <div className="card">Nenhum treino registrado ainda.</div>
      )}

      {!loading && !error && workouts.length > 0 && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>Recent Workouts</div>
          <table>
            <thead>
              <tr><th>Name</th><th>Member</th><th>Date</th><th>Exercises</th></tr>
            </thead>
            <tbody>
              {workouts.map((w) => (
                <tr
                  key={w.id}
                  onClick={() => navigate(`/workouts/${w.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{w.name}</td>
                  <td>{w.memberName}</td>
                  <td>{new Date(w.createdAt).toLocaleDateString()}</td>
                  <td>{w.exerciseCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}