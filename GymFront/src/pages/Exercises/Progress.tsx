import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchExerciseById, fetchExerciseProgress } from "../../api/exerciseApi";
import { useAuth } from "../../context/AuthContext";
import type { Exercise } from "../../types/exercise";
import type { ExerciseProgressDTO } from "../../types/progress";

function lineChartPath(points: number[], w = 680, h = 220) {
  const pad = 28;
  const xs = points.map((_, i) => pad + i * ((w - pad * 2) / (points.length - 1)));
  const max = Math.max(...points);
  const min = Math.min(...points);
  const ys = points.map((v) => h - 24 - ((v - min) / (max - min || 1)) * (h - 60));
  let d = `M${xs[0]},${ys[0]}`;
  for (let i = 1; i < xs.length; i++) {
    const cx = (xs[i - 1] + xs[i]) / 2;
    d += ` C${cx},${ys[i - 1]} ${cx},${ys[i]} ${xs[i]},${ys[i]}`;
  }
  return { d, xs, ys, w, h };
}

function formatKg(v: number): string {
  return v >= 1000 ? `${v.toLocaleString("en-US", { maximumFractionDigits: 0 })} kg` : `${v.toFixed(1)} kg`;
}

function formatPct(v: number): string {
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(1)}%`;
}

export default function Progress() {
  const { token } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [progress, setProgress] = useState<ExerciseProgressDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !token) return;
    
    fetchExerciseById(id)
      .then(setExercise)
      .catch(() => setError("Exercício não encontrado."));
      
    fetchExerciseProgress(id)
      .then(setProgress)
      .catch(() => setError("Failed to load progress data."));
  }, [id, token]);

  const volumePoints = progress ? progress.points.map((p) => p.volumeKg) : [];
  const chart = volumePoints.length >= 2 ? lineChartPath(volumePoints) : null;

  return (
    <>
      <div className="back-link" onClick={() => navigate("/exercises")}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Exercises
      </div>

      {error && <div className="card">{error}</div>}

      {exercise && (
        <>
          <div className="page-head">
            <div>
              <h1 className="page-title">{exercise.name}</h1>
              <p className="page-sub">{exercise.muscleGroup}</p>
            </div>
          </div>

          {progress && (
            <>
              <div className="grid g-4" style={{ marginBottom: 20 }}>
                <div className="card">
                  <div className="stat-label">Latest</div>
                  <div className="stat-num" style={{ fontSize: 17 }}>{progress.latestWeightKg} kg × {progress.latestReps}</div>
                </div>
                <div className="card">
                  <div className="stat-label">Best Set</div>
                  <div className="stat-num" style={{ fontSize: 17 }}>{progress.bestWeightKg} × {progress.bestReps}</div>
                </div>
                <div className="card">
                  <div className="stat-label">Total Reps</div>
                  <div className="stat-num" style={{ fontSize: 17 }}>{progress.totalReps}</div>
                </div>
                <div className="card">
                  <div className="stat-label">Progress</div>
                  <div className="stat-num" style={{ fontSize: 17, color: "var(--teal)" }}>
                    {formatPct(progress.progressPct)} {progress.progressPct >= 0 ? "↑" : "↓"}
                  </div>
                </div>
              </div>

              {chart && (
                <div className="card" style={{ marginBottom: 18 }}>
                  <div className="card-head">
                    <div className="card-title">Performance Progression</div>
                    <span className="chip">Last 3 months</span>
                  </div>
                  <svg viewBox={`0 0 ${chart.w} ${chart.h}`} width="100%" style={{ overflow: "visible" }}>
                    <path d={chart.d} fill="none" style={{ stroke: "var(--purple)" }} strokeWidth={2.5} strokeLinecap="round" />
                    {chart.xs.map((x, i) => (
                      <circle key={i} cx={x} cy={chart.ys[i]} r={4} style={{ fill: "var(--purple)" }} stroke="var(--card)" strokeWidth={2} />
                    ))}
                  </svg>
                </div>
              )}

              <div className="card">
                <div className="card-title" style={{ marginBottom: 14 }}>Session History</div>
                {progress.sessions.length === 0 ? (
                  <p style={{ color: "var(--muted)" }}>No sessions recorded yet.</p>
                ) : (
                  <table>
                    <thead>
                      <tr><th>Date</th><th>Volume</th><th>Reps</th><th>Best Set</th></tr>
                    </thead>
                    <tbody>
                      {progress.sessions.map((s) => (
                        <tr key={s.date}>
                          <td>{new Date(s.date).toLocaleDateString()}</td>
                          <td>{formatKg(s.volumeKg)}</td>
                          <td>{s.totalReps}</td>
                          <td>{s.bestSetWeightKg} kg × {s.bestSetReps}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
