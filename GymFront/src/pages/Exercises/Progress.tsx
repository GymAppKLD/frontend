import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchExerciseById, fetchExerciseProgress } from "../../api/exerciseApi";
import { useAuth } from "../../context/AuthContext";
import type { Exercise } from "../../types/exercise";
import type { ExerciseProgressDTO } from "../../types/progress";

function lineChartPath(points: number[], w = 680, h = 220) {
  if (!points || points.length === 0) return null;
  const pad = 28;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min;
  const ys = points.map((v) => range === 0 ? h / 2 : h - 24 - ((v - min) / range) * (h - 48));
  if (points.length === 1) {
    const xs = [w / 2];
    return { d: "", xs, ys, w, h, singlePoint: true };
  }
  const xs = points.map((_, i) => pad + i * ((w - pad * 2) / (points.length - 1)));
  let d = `M${xs[0]},${ys[0]}`;
  for (let i = 1; i < xs.length; i++) {
    const cx = (xs[i - 1] + xs[i]) / 2;
    d += ` C${cx},${ys[i - 1]} ${cx},${ys[i]} ${xs[i]},${ys[i]}`;
  }
  return { d, xs, ys, w, h, singlePoint: false };
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
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!id || !token) return;
    fetchExerciseById(id).then(setExercise).catch(() => setError("EXERCISE NOT FOUND"));
    fetchExerciseProgress(id).then(setProgress).catch(() => setError("FAILED TO LOAD TELEMETRY"));
  }, [id, token]);

  const volumePoints = progress ? progress.points.map((p) => p.volumeKg) : [];
  const chart = lineChartPath(volumePoints);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 64 }}>
      <div className="back-link" onClick={() => navigate("/exercises")}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        DATABASE
      </div>

      {error && <div className="card" style={{ color: "var(--danger)", fontFamily: "var(--mono)", borderColor: "var(--danger)" }}>[ ERR: {error} ]</div>}

      {exercise && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, borderBottom: "1px solid var(--border)", paddingBottom: 24, marginTop: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.15em", marginBottom: 8, textTransform: "uppercase" }}>MODULE // {exercise.muscleGroup}</div>
              <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", textTransform: "uppercase" }}>{exercise.name}</h1>
            </div>
            <div className="score-cell" style={{ fontSize: 11, letterSpacing: "0.1em" }}>E1RM MODE</div>
          </div>

          {progress && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
                <div className="card" style={{ textAlign: "center", padding: 20 }}>
                  <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.1em", marginBottom: 12 }}>LATEST</div>
                  <div className="score-cell active" style={{ fontSize: 16, width: "100%" }}>{progress.latestWeightKg} KG × {progress.latestReps}</div>
                </div>
                <div className="card" style={{ textAlign: "center", padding: 20 }}>
                  <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.1em", marginBottom: 12 }}>BEST SET</div>
                  <div className="score-cell success" style={{ fontSize: 16, width: "100%" }}>{progress.bestWeightKg} × {progress.bestReps}</div>
                </div>
                <div className="card" style={{ textAlign: "center", padding: 20 }}>
                  <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.1em", marginBottom: 12 }}>ESTIMATED 1RM</div>
                  <div className="score-cell" style={{ fontSize: 16, width: "100%" }}>{progress.estimated1Rm.toFixed(1)} KG</div>
                </div>
                <div className="card" style={{ textAlign: "center", padding: 20 }}>
                  <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.1em", marginBottom: 12 }}>PROGRESSION</div>
                  <div className="score-cell" style={{ fontSize: 16, width: "100%", background: progress.progressPct >= 0 ? "var(--success-glow)" : "var(--danger-glow)", color: progress.progressPct >= 0 ? "var(--success)" : "var(--danger)", boxShadow: `inset 0 0 0 1px ${progress.progressPct >= 0 ? "var(--success)" : "var(--danger)"}` }}>
                    {formatPct(progress.progressPct)} {progress.progressPct >= 0 ? "↑" : "↓"}
                  </div>
                </div>
              </div>

              {chart && (
                <div className="card" style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
                    <div style={{ fontSize: 13, fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted)", fontWeight: 800 }}>ESTIMATED 1RM — 90D</div>
                    <span className="score-cell" style={{ fontSize: 11 }}>LAST 3 MONTHS</span>
                  </div>
                  <svg viewBox={`0 0 ${chart.w} ${chart.h}`} width="100%" style={{ overflow: "visible" }}>
                    {!chart.singlePoint && <path d={chart.d} fill="none" style={{ stroke: "var(--accent)" }} strokeWidth={2.5} strokeLinecap="round" />}
                    {chart.xs.map((x: number, i: number) => (
                      <g key={i}>
                        <circle
                          cx={x} cy={chart.ys[i]} r={hoverIdx === i ? 6 : 4}
                          fill="var(--accent)" stroke="var(--card)" strokeWidth={2}
                          onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)}
                          style={{ cursor: "pointer", transition: "r 0.1s" }}
                        />
                        {hoverIdx === i && (
                          <g style={{ pointerEvents: "none" }}>
                            <rect x={x - 30} y={chart.ys[i] - 32} width="60" height="24" rx="4" fill="var(--ink)" />
                            <text x={x} y={chart.ys[i] - 16} fill="var(--bg)" fontSize="12" fontFamily="var(--mono)" fontWeight="800" textAnchor="middle">{volumePoints[i].toFixed(1)} KG</text>
                          </g>
                        )}
                      </g>
                    ))}
                  </svg>
                </div>
              )}

              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
                  <div style={{ fontSize: 13, fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted)", fontWeight: 800 }}>SESSION HISTORY</div>
                  <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--muted)" }}>{progress.sessions.length} LOGS</div>
                </div>
                {progress.sessions.length === 0 ? (
                  <p style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 13 }}>[ NO SESSIONS LOGGED ]</p>
                ) : (
                  <table>
                    <thead><tr><th>DATE</th><th>SETS</th><th>REPS</th><th style={{ textAlign: "right" }}>BEST SET</th></tr></thead>
                    <tbody>
                      {progress.sessions.map((s) => (
                        <tr key={s.date}>
                          <td style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--muted)" }}>{new Date(s.date).toLocaleDateString()}</td>
                          <td><span className="score-cell" style={{ fontSize: 12, padding: "4px 8px" }}>{s.volumeKg}</span></td>
                          <td style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>{s.totalReps}</td>
                          <td style={{ textAlign: "right" }}><span className="score-cell success" style={{ fontSize: 12 }}>{s.bestSetWeightKg} KG × {s.bestSetReps}</span></td>
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
    </div>
  );
}
