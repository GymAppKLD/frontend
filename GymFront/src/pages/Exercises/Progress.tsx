import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchExerciseById } from "../../api/exerciseApi";
import type { Exercise } from "../../types/exercise";

// Mock progress data — backend has no session/history tracking per exercise yet.
// Swap for a real fetch once an endpoint like GET /api/exercises/{id}/progress exists.
const MOCK_VOLUME_POINTS = [1800, 1850, 2000, 2180, 2300, 2420, 2530];
const MOCK_SESSIONS = [
  { date: "Jun 21", volume: "2,530 kg", reps: "34", bestSet: "80 kg × 6" },
  { date: "Jun 17", volume: "2,420 kg", reps: "32", bestSet: "80 kg × 5" },
  { date: "Jun 14", volume: "2,300 kg", reps: "30", bestSet: "77.5 kg × 6" },
  { date: "Jun 10", volume: "2,180 kg", reps: "30", bestSet: "75 kg × 7" },
];

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

export default function Progress() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchExerciseById(id)
      .then(setExercise)
      .catch(() => setError("Exercício não encontrado."));
  }, [id]);

  const chart = lineChartPath(MOCK_VOLUME_POINTS);

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

          <div className="grid g-4" style={{ marginBottom: 20 }}>
            <div className="card"><div className="stat-label">Latest</div><div className="stat-num" style={{ fontSize: 17 }}>2,530 kg</div></div>
            <div className="card"><div className="stat-label">Best Set</div><div className="stat-num" style={{ fontSize: 17 }}>80 × 6</div></div>
            <div className="card"><div className="stat-label">Total Reps</div><div className="stat-num" style={{ fontSize: 17 }}>34</div></div>
            <div className="card"><div className="stat-label">Progress</div><div className="stat-num" style={{ fontSize: 17, color: "var(--teal)" }}>+30.4% ↑</div></div>
          </div>

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

          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>Session History</div>
            <table>
              <thead>
                <tr><th>Date</th><th>Volume</th><th>Reps</th><th>Best Set</th></tr>
              </thead>
              <tbody>
                {MOCK_SESSIONS.map((s) => (
                  <tr key={s.date}>
                    <td>{s.date}</td>
                    <td>{s.volume}</td>
                    <td>{s.reps}</td>
                    <td>{s.bestSet}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}